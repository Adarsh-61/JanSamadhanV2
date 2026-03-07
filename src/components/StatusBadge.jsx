const STATUS_CONFIG = {
    no_action: {
        label: 'No Action',
        className: 'status-no-action',
        dotClassName: 'status-dot-red',
    },
    working: {
        label: 'In Progress',
        className: 'status-working',
        dotClassName: 'status-dot-amber',
    },
    solved: {
        label: 'Resolved',
        className: 'status-solved',
        dotClassName: 'status-dot-green',
    },
};

export default function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.no_action;

    return (
        <span className={`status-badge ${config.className}`}>
            <span className={`status-dot ${config.dotClassName}`} />
            {config.label}
        </span>
    );
}

export { STATUS_CONFIG };
