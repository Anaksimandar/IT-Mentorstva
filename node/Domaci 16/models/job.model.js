const db = require("../db/db"); // your mysql2 pool, adjust path as needed

const Job = {
  tableName: "job_ads",
  create: async (userId, companyId, technologies, title, description, salary, due_date) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Insert into job ads
      const [jobResult] = await connection.query(
        `INSERT INTO job_ads (user_id, company_id, title, description, salary, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, companyId, title, description, salary, due_date],
      );

      const jobId = jobResult.insertId;

      // 2. Insert into job_technologies (only if there are any)
      const techArray = (Array.isArray(technologies) ? technologies : [technologies]).filter(
        Boolean,
      );
      if (techArray.length > 0) {
        const values = techArray.map((techId) => [jobId, techId]);
        await connection.query("INSERT INTO job_technologies (job_id, technology_id) VALUES ?", [
          values,
        ]);
      }

      await connection.commit();

      return jobId;
    } catch (err) {
      await connection.rollback();
      throw err; // let the caller (route handler) decide how to respond
    } finally {
      connection.release(); // always return the connection to the pool
    }
  },
  getAll: async (whereClause = "", params = [], orderClause = "ORDER BY job_ads.due_date ASC") => {
    const [job_ads] = await db.query(
      `
        SELECT
          job_ads.id, job_ads.title, job_ads.description, job_ads.views, job_ads.salary, job_ads.due_date,
          users.id AS user_id, users.name AS user_name,
          companies.id AS company_id, companies.name AS company_name
        FROM job_ads
        JOIN users ON users.id = job_ads.user_id
        JOIN companies ON companies.id = job_ads.company_id
        ${whereClause}
        ${orderClause}
     `,
      params,
    );

    if (job_ads.length === 0) return [];

    const jobIds = job_ads.map((job) => job.id);

    const [techRows] = await db.query(
      `
      SELECT job_technologies.job_id, technologies.id, technologies.name
      FROM job_technologies
      JOIN technologies ON technologies.id = job_technologies.technology_id
      WHERE job_technologies.job_id IN (?)
    `,
      [jobIds],
    );

    return job_ads.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      salary: job.salary,
      due_date: job.due_date,
      views: job.views,
      user: { id: job.user_id, name: job.user_name },
      company: { id: job.company_id, name: job.company_name },
      technologies: techRows
        .filter((t) => t.job_id === job.id)
        .map((t) => ({ id: t.id, name: t.name })),
    }));
  },
  userSearch: async ({ title, technology, sortBy } = {}) => {
    const conditions = [];
    const params = [];

    const normalizedTitle = typeof title === "string" ? title.trim() : "";

    if (normalizedTitle) {
      conditions.push("job_ads.title LIKE ?");
      params.push(`%${normalizedTitle}%`);
    }

    if (technology) {
      const data = await Job.getAllByTechnology(technology);
      const jobIds = data.map((job) => job.job_id);

      if (jobIds.length === 0) {
        conditions.push("1 = 0");
      } else {
        const placeholders = jobIds.map(() => "?").join(", ");
        conditions.push(`job_ads.id IN (${placeholders})`);
        params.push(...jobIds);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Whitelist allowed sort options — NEVER interpolate sortBy directly into SQL
    const sortOptions = {
      ascending: "ORDER BY job_ads.views ASC",
      descending: "ORDER BY job_ads.views DESC",
      oldest: "ORDER BY job_ads.due_date ASC",
    };
    const orderClause = sortOptions[sortBy] || sortOptions.oldest; // sensible default

    return Job.getAll(whereClause, params, orderClause);
  },
  search: async ({ title, minSalary, maxSalary, dueDate, technology } = {}) => {
    const conditions = [];
    const params = [];

    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedMinSalary =
      minSalary !== undefined && minSalary !== null ? String(minSalary).trim() : "";
    const normalizedMaxSalary =
      maxSalary !== undefined && maxSalary !== null ? String(maxSalary).trim() : "";

    if (normalizedTitle) {
      conditions.push("job_ads.title LIKE ?");
      params.push(`%${normalizedTitle}%`);
    }
    if (normalizedMinSalary) {
      conditions.push("job_ads.salary >= ?");
      params.push(Number(normalizedMinSalary));
    }
    if (normalizedMaxSalary) {
      conditions.push("job_ads.salary <= ?");
      params.push(Number(normalizedMaxSalary));
    }
    if (dueDate) {
      const parsedDueDate = new Date(dueDate);
      if (!isNaN(parsedDueDate.getTime())) {
        conditions.push("DATE(job_ads.due_date) = ?");
        params.push(dueDate); // raw string, e.g. "2026-08-28"
      }
    }
    if (technology) {
      const data = await Job.getAllByTechnology(technology);
      const jobIds = data.map((job) => job.job_id);

      if (jobIds.length === 0) {
        // Technology exists but no jobs use it
        conditions.push("1 = 0");
      } else {
        const placeholders = jobIds.map(() => "?").join(", ");

        conditions.push(`job_ads.id IN (${placeholders})`);
        params.push(...jobIds);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    console.log({ whereClause, params });
    return Job.getAll(whereClause, params);
  },
  delete: async (id) => {
    const [rows] = await db.query(`DELETE FROM job_ads WHERE id = ?`, [id]);
    return rows.affectedRows;
  },
  getAllByTechnology: async (technologyId) => {
    const [rows] = await db.query("SELECT job_id FROM job_technologies WHERE technology_id = ?", [
      technologyId,
    ]);
    return rows;
  },
  incrementViews: async (jobId) => {
    await db.query(`UPDATE job_ads SET views = views + 1 WHERE id = ?`, [jobId]);
  },
};

module.exports = Job;
