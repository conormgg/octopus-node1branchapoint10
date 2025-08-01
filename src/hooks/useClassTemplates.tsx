
import { useAuth } from '@/hooks/useAuth';
import { useTemplateData } from './templates/useTemplateData';
import { ClassTemplate } from '@/types/templates';
import { Student } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateStudents } from './session/utils';

export const useClassTemplates = () => {
  const { user } = useAuth();
  const { templates, isLoading, loadTemplate, refreshTemplates } = useTemplateData(user);
  const { toast } = useToast();

  const saveTemplate = async (templateName: string, students: Student[], duration?: number | ''): Promise<ClassTemplate | null> => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save templates.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data: templateData, error: templateError } = await supabase
        .from('saved_classes')
        .insert({
          teacher_id: user.id,
          class_name: templateName,
          duration_minutes: duration && typeof duration === 'number' ? duration : null,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      if (students.length > 0) {
        const validStudents = validateStudents(students);

        if (validStudents.length > 0) {
          const studentsToInsert = validStudents.map(student => ({
            saved_class_id: templateData.id,
            student_name: student.name.trim(),
            student_email: student.email.trim() || null,
          }));

          const { error: studentsError } = await supabase
            .from('saved_class_students')
            .insert(studentsToInsert);

          if (studentsError) throw studentsError;
        }
      }

      toast({
        title: "Template Saved!",
        description: `Class template "${templateName}" has been saved successfully.`,
      });

      const refreshedTemplatesList = await refreshTemplates();
      return refreshedTemplatesList.find(t => t.id === templateData.id) || null;
    } catch (error: any) {
      toast({
        title: "Error Saving Template",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTemplate = async (
    templateId: number, 
    templateName: string, 
    students: Student[], 
    duration?: number | ''
  ): Promise<{ success: boolean, updatedTemplate?: ClassTemplate, refreshedTemplates?: ClassTemplate[] }> => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update templates.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      const { error: templateError } = await supabase
        .from('saved_classes')
        .update({
          class_name: templateName,
          duration_minutes: duration && typeof duration === 'number' ? duration : null,
        })
        .eq('id', templateId)
        .eq('teacher_id', user.id);

      if (templateError) throw templateError;

      const { error: deleteError } = await supabase
        .from('saved_class_students')
        .delete()
        .eq('saved_class_id', templateId);

      if (deleteError) throw deleteError;

      const validStudents = validateStudents(students);
      if (validStudents.length > 0) {
        const studentsToInsert = validStudents.map(student => ({
          saved_class_id: templateId,
          student_name: student.name.trim(),
          student_email: student.email.trim() || null,
        }));

        const { error: studentsError } = await supabase
          .from('saved_class_students')
          .insert(studentsToInsert);

        if (studentsError) throw studentsError;
      }

      toast({
        title: "Template Updated!",
        description: `Class template "${templateName}" has been updated successfully.`,
      });

      const refreshedTemplatesList = await refreshTemplates();
      const updatedTemplate = refreshedTemplatesList.find(t => t.id === templateId);
      
      return { success: true, updatedTemplate, refreshedTemplates: refreshedTemplatesList };
    } catch (error: any) {
      toast({
        title: "Error Updating Template",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const deleteTemplate = async (templateId: number, templateName: string) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to delete templates.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('saved_classes')
        .delete()
        .eq('id', templateId)
        .eq('teacher_id', user.id);

      if (error) throw error;

      toast({
        title: "Template Deleted!",
        description: `Class template "${templateName}" has been deleted successfully.`,
      });

      await refreshTemplates();
      return true;
    } catch (error: any) {
      toast({
        title: "Error Deleting Template",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    templates,
    isLoading,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    loadTemplate,
    refreshTemplates,
  };
};
