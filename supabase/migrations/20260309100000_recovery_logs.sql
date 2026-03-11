-- Recovery attempt logging for security auditing
CREATE TABLE IF NOT EXISTS recovery_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    identifier_used TEXT NOT NULL,
    ip_address TEXT,
    code_sent BOOLEAN DEFAULT true,
    code_verified BOOLEAN DEFAULT false,
    password_reset BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recovery_logs_account_id ON recovery_logs(account_id);
CREATE INDEX idx_recovery_logs_created_at ON recovery_logs(created_at DESC);

-- RLS: only service_role can access (API routes use supabaseAdmin)
ALTER TABLE recovery_logs ENABLE ROW LEVEL SECURITY;
