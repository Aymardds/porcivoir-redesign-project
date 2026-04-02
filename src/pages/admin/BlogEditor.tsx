import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '@/context/AuthContext';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'image'
];

export default function BlogEditor() {
  const { id } = useParams();
  const isEditing = id && id !== 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(isEditing ? true : false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    is_published: false,
  });

  useEffect(() => {
    if (isEditing) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'article');
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData({
      ...formData,
      title: newTitle,
      slug: !isEditing ? generateSlug(newTitle) : formData.slug
    });
  };

  const handleSave = async (publish: boolean) => {
    if (!formData.title || !formData.content) {
      toast.error('Le titre et le contenu sont obligatoires');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        is_published: publish,
        author_id: user?.id,
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        const { error } = await supabase
          .from('blogs')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
        toast.success(`Article mis à jour et ${publish ? 'publié' : 'sauvegardé en brouillon'}`);
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert(payload);
        if (error) throw error;
        toast.success(`Article créé et ${publish ? 'publié' : 'sauvegardé en brouillon'}`);
        navigate('/admin/blog');
      }
      
      if (isEditing && publish !== formData.is_published) {
        setFormData({ ...formData, is_published: publish });
      }
    } catch (error: any) {
      console.error(error);
      if (error?.code === '23505') {
        toast.error('Ce permalien (slug) existe déjà. Veuillez le modifier.');
      } else {
        toast.error("Erreur lors de l'enregistrement de l'article");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold font-sans">
            {isEditing ? "Modifier l'article" : "Créer un nouvel article"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Brouillon
          </Button>
          <Button 
            className="bg-primary text-white"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {formData.is_published ? "Mettre à jour" : "Publier maintenant"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'article</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                className="text-lg font-bold"
                placeholder="Ex: Les secrets d'un bon rôti de porc..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Contenu</Label>
              <div className="bg-white rounded-md text-black">
                <ReactQuill 
                  theme="snow" 
                  value={formData.content} 
                  onChange={(val) => setFormData({...formData, content: val})} 
                  modules={modules}
                  formats={formats}
                  className="h-64 mb-12 border-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-2">Paramètres de publication</h3>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Permalien / URL (Slug)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="les-secrets-dun-bon-roti"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">doit être unique sans espaces</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Résumé (Excerpt)</Label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="w-full h-24 bg-background border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Un court résumé qui apparaîtra dans la liste des articles..."
              />
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-2">Image de couverture</h3>
            <div className="space-y-2">
              <Label htmlFor="cover_image">URL de l'image (optionnel)</Label>
              <Input
                id="cover_image"
                value={formData.cover_image || ''}
                onChange={(e) => setFormData({...formData, cover_image: e.target.value})}
                placeholder="https://..."
              />
            </div>
            {formData.cover_image && (
              <div className="mt-4 rounded-lg overflow-hidden border border-border aspect-video">
                <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            {!formData.cover_image && (
               <div className="mt-4 rounded-lg border border-dashed border-border aspect-video flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                 <ImageIcon className="w-8 h-8 opacity-20 mb-2" />
                 <span className="text-xs">Aperçu de l'image</span>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
