import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, Calendar, User, FileText, Loader2 } from 'lucide-react';

export default function Blog() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select(`
            id,
            title,
            slug,
            excerpt,
            cover_image,
            created_at,
            profiles(first_name, last_name)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBlogs(data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedBlogs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-black font-sans text-foreground tracking-tight mb-4 text-orange-gradient">
              Actualités & Recettes
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvrez les dernières nouveautés de Porc'Ivoire, nos conseils de préparation et d'exquises recettes.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
              <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-sans text-foreground">Aucun article publié</h2>
              <p className="text-muted-foreground mt-2">Revenez bientôt pour lire nos derniers articles !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article 
                  key={blog.id} 
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
                >
                  <Link to={`/blog/${blog.slug}`} className="block h-56 relative overflow-hidden bg-secondary">
                    {blog.cover_image ? (
                      <img 
                        src={blog.cover_image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <FileText className="w-12 h-12 opacity-10" />
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{new Date(blog.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>{blog.profiles?.first_name || 'Équipe PorcIvoire'}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold font-sans mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      <Link to={`/blog/${blog.slug}`}>
                        {blog.title}
                      </Link>
                    </h2>
                    
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                      {blog.excerpt || "Cliquez pour lire l'intégralité de cet article passionnant."}
                    </p>
                    
                    <div className="mt-auto">
                      <Link 
                        to={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-sm uppercase tracking-wider"
                      >
                        Lire l'article <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
