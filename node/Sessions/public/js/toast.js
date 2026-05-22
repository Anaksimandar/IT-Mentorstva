/**
 * Toast Notification System
 * A lightweight, customizable toast notification library
 */

class Toast {
	constructor(options = {}) {
		this.defaults = {
			duration: 4000,
			position: "top-right",
			...options,
		};
		this.container = null;
		this.init();
	}

	init() {
		// Create container if not exists
		let container = document.querySelector(".toast-container");
		if (!container) {
			container = document.createElement("div");
			container.className = "toast-container";
			document.body.appendChild(container);
		}
		this.container = container;
	}

	show(options) {
		const {
			type = "info",
			title = "",
			message = "",
			duration = this.defaults.duration,
		} = options;

		const toast = document.createElement("div");
		toast.className = `toast toast-${type}`;
		toast.innerHTML = `
			<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				${this.getIcon(type)}
			</svg>
			<div class="toast-content">
				${title ? `<div class="toast-title">${title}</div>` : ""}
				${message ? `<div class="toast-message">${message}</div>` : ""}
			</div>
			<button class="toast-close" onclick="this.parentElement.remove()">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12"/>
				</svg>
			</button>
			<div class="toast-progress" style="width: 100%; animation: shrink ${duration}ms linear forwards;"></div>
		`;

		// Add shrink animation for progress bar
		const style = document.createElement("style");
		style.textContent = `
			@keyframes shrink {
				from { width: 100%; }
				to { width: 0%; }
			}
		`;
		document.head.appendChild(style);

		this.container.appendChild(toast);

		// Auto remove after duration
		setTimeout(() => {
			this.remove(toast);
		}, duration);

		return toast;
	}

	remove(toast) {
		if (toast && toast.parentElement) {
			toast.classList.add("toast-hiding");
			setTimeout(() => {
				toast.remove();
			}, 300);
		}
	}

	getIcon(type) {
		const icons = {
			success:
				'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
			error:
				'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
			warning:
				'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
			info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
		};
		return icons[type] || icons.info;
	}

	// Convenience methods
	success(title, message) {
		return this.show({ type: "success", title, message });
	}

	error(title, message) {
		return this.show({ type: "error", title, message });
	}

	warning(title, message) {
		return this.show({ type: "warning", title, message });
	}

	info(title, message) {
		return this.show({ type: "info", title, message });
	}
}

// Create global instance
const toast = new Toast();

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
	module.exports = Toast;
}
