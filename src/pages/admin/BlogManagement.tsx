import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Pencil, FileText, Trash2, Plus, Eye, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          slug,
          is_published,
          created_at,
          cover_image,
          profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des articles de blog');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Article ${!currentStatus ? 'publié' : 'retiré'} avec succès`);
      fetchBlogs();
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.")) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Article supprimé avec succès');
      fetchBlogs();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Blog & Actualités</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les articles de votre blog pour tenir vos clients informés.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/blog/new')} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl flex items-center p-2 mb-4 max-w-md">
        <FileText className="w-4 h-4 ml-2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un article..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 shadow-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-muted-foreground">Chargement des articles...</p>
        ) : filteredBlogs.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-card rounded-xl border border-dashed border-border flex flex-col items-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold text-foreground">Aucun article trouvé</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              Commencez à rédiger du contenu pour attirer plus de visiteurs sur votre site.
            </p>
            <Button onClick={() => navigate('/admin/blog/new')} className="mt-6 bg-primary font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Créer mon premier article
            </Button>
          </div>
        ) : (
          filteredBlogs.map((blog) => (
            <div key={blog.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow group">
              <div className="h-40 bg-secondary/50 relative">
                {blog.cover_image ? (
                  <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg shadow-sm ${blog.is_published ? 'bg-primary text-white' : 'bg-yellow-500 text-white'}`}>
                    {blog.is_published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-auto flex justify-between items-center pt-4 border-t border-border">
                  <span>
                    {new Date(blog.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                  <span>
                    Par {blog.profiles?.first_name || 'Admin'}
                  </span>
                </p>
              </div>
              
              <div className="px-3 py-3 border-t border-border bg-secondary/20 flex justify-between items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={() => togglePublish(blog.id, blog.is_published)}
                >
                  {blog.is_published ? <Eye className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1 opacity-50" />}
                  {blog.is_published ? 'Retirer' : 'Publier'}
                </Button>
                
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => navigate(`/admin/blog/edit/${blog.id}`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                    onClick={() => handleDelete(blog.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
