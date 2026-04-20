-- Create Trainings Table
CREATE TABLE IF NOT EXISTS public.trainings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    price NUMERIC NOT NULL,
    expert_trainer TEXT,
    cover_image TEXT,
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

-- Allow public to see active trainings
CREATE POLICY "Allow public read access on active trainings"
ON public.trainings FOR SELECT
USING (is_active = true);

-- Allow admins full access
CREATE POLICY "Allow admin full access on trainings"
ON public.trainings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'stock_manager')
    )
);

-- Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.training_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.training_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can see their own
CREATE POLICY "Allow users to view their own subscriptions"
ON public.training_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own
CREATE POLICY "Allow users to create their own subscriptions"
ON public.training_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins full access
CREATE POLICY "Allow admin full access on subscriptions"
ON public.training_subscriptions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'stock_manager')
    )
);
