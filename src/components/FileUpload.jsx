'use client';

import { useState, useRef } from 'react';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_FILES = 3;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function FileUpload({ files, onChange }) {
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    function validateAndAdd(incoming) {
        setError('');
        const list = Array.from(incoming);

        if (files.length + list.length > MAX_FILES) {
            setError(`You can upload a maximum of ${MAX_FILES} files.`);
            return;
        }

        for (const file of list) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError(`"${file.name}" is not a supported file type.`);
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                setError(`"${file.name}" exceeds the 2 MB size limit.`);
                return;
            }
        }

        onChange([...files, ...list]);
    }

    function removeFile(index) {
        setError('');
        onChange(files.filter((_, i) => i !== index));
    }

    return (
        <div>
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); validateAndAdd(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                style={{
                    padding: '28px 20px',
                    borderRadius: 8,
                    border: `2px dashed ${dragOver ? 'var(--color-primary-500)' : 'var(--color-gray-300)'}`,
                    backgroundColor: dragOver ? 'var(--color-primary-50)' : '#ffffff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                }}
                role="button"
                tabIndex={0}
                aria-label="Upload files"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
            >
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-700)', marginBottom: 4 }}>
                    Click to upload or drag files here
                </p>
                <p className="text-caption">
                    JPEG, PNG, GIF, WebP, or PDF. Max 2 MB each, up to {MAX_FILES} files.
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_TYPES.join(',')}
                    onChange={(e) => { validateAndAdd(e.target.files); e.target.value = ''; }}
                    style={{ display: 'none' }}
                    aria-hidden="true"
                />
            </div>

            {error && <p className="form-error" style={{ marginTop: 6 }}>{error}</p>}

            {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                    {files.map((file, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                borderRadius: 6,
                                backgroundColor: 'var(--color-gray-50)',
                                border: '1px solid var(--color-gray-200)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {file.name}
                                    </p>
                                    <p className="text-caption">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="btn-ghost"
                                style={{ padding: 4, color: 'var(--color-gray-400)' }}
                                aria-label={`Remove ${file.name}`}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
