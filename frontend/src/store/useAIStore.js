import { create } from 'zustand';
import apiClient from '../api/client';

export const useAIStore = create((set, get) => ({
    generatedResume: '',
    isGenerating: false,
    error: null,

    // Mutations/Actions
    builderMutation: { isPending: false },
    pdfMutation: { isPending: false },
    persistenceMutation: { isPending: false },

    generateResume: async (formData) => {
        set({ isGenerating: true, error: null });
        // Manually updating state to mimic mutation status for UI
        set(state => ({ builderMutation: { ...state.builderMutation, isPending: true } }));
        
        try {
            const res = await apiClient.post('/ai/resume-generate', formData);
            const resumeMarkdown = res.data.data.resume;
            set({ generatedResume: resumeMarkdown, isGenerating: false });
            set(state => ({ builderMutation: { ...state.builderMutation, isPending: false } }));
            return resumeMarkdown;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to generate resume';
            set({ error: msg, isGenerating: false });
            set(state => ({ builderMutation: { ...state.builderMutation, isPending: false } }));
            throw new Error(msg);
        }
    },

    syncResumeToProfile: async (resumeMarkdown) => {
        set(state => ({ persistenceMutation: { ...state.persistenceMutation, isPending: true } }));
        try {
            // First, we might want to parse important bits or just save the whole thing as a preferred summary/projects
            // For now, let's assume we update the profile with the latest data
            // In a more complex app, AI would extract structured data back to DB
            await apiClient.put('/profile/me', { resume_markdown: resumeMarkdown });
            set(state => ({ persistenceMutation: { ...state.persistenceMutation, isPending: false } }));
            return true;
        } catch (err) {
            set(state => ({ persistenceMutation: { ...state.persistenceMutation, isPending: false } }));
            return false;
        }
    },

    downloadPDF: async (resumeMarkdown) => {
        set(state => ({ pdfMutation: { ...state.pdfMutation, isPending: true } }));
        try {
            const response = await apiClient.post('/ai/resume-pdf', { htmlContent: resumeMarkdown }, { responseType: 'blob' });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'resume.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            set(state => ({ pdfMutation: { ...state.pdfMutation, isPending: false } }));
        } catch (err) {
            set(state => ({ pdfMutation: { ...state.pdfMutation, isPending: false } }));
            console.error('PDF Download failed', err);
        }
    }
}));
