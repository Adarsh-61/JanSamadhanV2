'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import FileUpload from '@/components/FileUpload';

export default function SubmitComplaint() {
    const router = useRouter();
    const toast = useToast();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    function validate() {
        const errs = {};
        if (description.trim().length < 6) {
            errs.description = 'Description must be at least 6 characters.';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function uploadFiles() {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'File upload failed.');
        return data.attachments || [];
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            let attachments = [];
            if (files.length > 0) {
                attachments = await uploadFiles();
            }

            let recaptchaToken = null;
            if (executeRecaptcha) {
                try {
                    recaptchaToken = await executeRecaptcha('submit_complaint');
                } catch {
                    // reCAPTCHA unavailable, proceed without token
                }
            }

            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim() || null,
                    description: description.trim(),
                    attachments,
                    recaptchaToken,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit');

            setSubmitted(true);
            toast.success('Your complaint has been submitted successfully.');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
                <div className="card-elevated animate-fade-in" style={{ padding: '48px 32px', textAlign: 'center' }}>
                    <div style={{ maxWidth: 400, margin: '0 auto' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            backgroundColor: 'var(--color-status-green-light)',
                            border: '4px solid #fff',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 className="heading-2" style={{ marginBottom: 12, color: 'var(--color-gray-900)' }}>Complaint Submitted</h2>
                        <p className="text-body" style={{ marginBottom: 32, color: 'var(--color-gray-600)' }}>
                            Your complaint has been registered and is now publicly visible. You can track its status on the board.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={() => router.push('/')}>
                                View Board
                            </button>
                            <button className="btn btn-secondary" onClick={() => {
                                setSubmitted(false); setTitle(''); setDescription(''); setFiles([]);
                            }}>
                                Submit Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <h1 className="heading-1" style={{ marginBottom: 8 }}>Submit Complaint</h1>
                    <p className="text-body" style={{ color: 'var(--color-gray-600)' }}>
                        Please provide the details below. This submission is anonymous.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="card-elevated" style={{ padding: 24, marginBottom: 16 }}>
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">
                                Title <span className="form-hint">(optional)</span>
                            </label>
                            <input
                                id="title"
                                className="form-input"
                                placeholder="Brief summary of your complaint"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                maxLength={200}
                                autoComplete="off"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label form-label-required">Description</label>
                            <textarea
                                id="description"
                                className={`form-input ${errors.description ? 'form-input-error' : ''}`}
                                placeholder="Provide a detailed description of the issue"
                                value={description}
                                onChange={e => { setDescription(e.target.value); if (errors.description) setErrors({}); }}
                                rows={5}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                {errors.description ? <p className="form-error">{errors.description}</p> : <span />}
                                <span className="text-caption">{description.length} characters</span>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">
                                Attachments <span className="form-hint">(optional)</span>
                            </label>
                            <FileUpload files={files} onChange={setFiles} />
                        </div>
                    </div>

                    <div style={{ paddingBottom: 16 }}>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%' }}>
                            {submitting && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
                            {submitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>

                        <p className="text-caption" style={{ color: 'var(--color-gray-400)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
                            Privacy Note: Do not include personal data. This submission is anonymous and publicly visible.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
