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
  getAll: async (whereClause = "", params = []) => {
    const [job_ads] = await db.query(
      `
        SELECT
          job_ads.id, job_ads.title, job_ads.description, job_ads.salary, job_ads.due_date,
          users.id AS user_id, users.name AS user_name,
          companies.id AS company_id, companies.name AS company_name
        FROM job_ads
        JOIN users ON users.id = job_ads.user_id
        JOIN companies ON companies.id = job_ads.company_id
        ${whereClause}
        ORDER BY job_ads.due_date ASC
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
      user: { id: job.user_id, name: job.user_name },
      company: { id: job.company_id, name: job.company_name },
      technologies: techRows
        .filter((t) => t.job_id === job.id)
        .map((t) => ({ id: t.id, name: t.name })),
    }));
  },
  search: async ({ title, minSalary, maxSalary } = {}) => {
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    console.log({ whereClause, params });
    return Job.getAll(whereClause, params);
  },
};

module.exports = Job;
