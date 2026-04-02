import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DOMPurify from 'dompurify';
import { ArrowLeft, Calendar, User, Loader2 } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select(`
            *,
            profiles(first_name, last_name)
          `)
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error) throw error;
        setBlog(data);
        
        if (data) {
          document.title = `${data.title} | Porc'Ivoire`;
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-secondary">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col bg-secondary">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl font-bold mb-4 font-sans text-foreground">Article introuvable</h1>
          <p className="text-muted-foreground mb-8">Cet article n'existe pas ou a été retiré.</p>
          <Link to="/blog" className="text-primary hover:underline font-bold inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux actualités
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Sécuriser le contenu HTML provenant de ReactQuill
  const sanitizedContent = DOMPurify.sanitize(blog.content);

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      
      <main className="flex-grow pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au blog
          </Link>

          <article className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {blog.cover_image && (
              <div className="w-full h-64 sm:h-96 relative">
                <img 
                  src={blog.cover_image} 
                  alt={blog.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6 sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{new Date(blog.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>{blog.profiles?.first_name || 'Équipe PorcIvoire'}</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans text-foreground leading-tight mb-8">
                {blog.title}
              </h1>

              {/* Prose : Tailwind typography styles injected manually since we don't have @tailwindcss/typography installed */}
              <div 
                className="prose prose-lg max-w-none text-foreground/80
                           prose-headings:font-bold prose-headings:font-sans prose-headings:text-foreground
                           prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                           prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                           prose-p:mb-6 prose-p:leading-relaxed
                           prose-a:text-primary prose-a:font-bold hover:prose-a:text-primary/80
                           prose-strong:font-bold prose-strong:text-foreground
                           prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6
                           prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-6
                           prose-img:rounded-xl prose-img:shadow-md prose-img:my-8"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
