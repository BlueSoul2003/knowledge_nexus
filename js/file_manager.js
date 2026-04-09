import { supabase } from './supabase_client.js';
import { trackActivity } from './activity_tracker.js';

class FileManager {
    constructor() {
        this.bucketName = 'user_files';
        this.initEventListeners();
        this.fetchMyFiles();
        this.checkAdminAndInit();
    }

    initEventListeners() {
        const fileInput = document.getElementById('file-input');
        const fileNameDisplay = document.getElementById('file-selected-name');
        const uploadForm = document.getElementById('upload-form');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileNameDisplay.textContent = file.name;
                    fileNameDisplay.classList.remove('hidden');
                }
            });
        }

        if (uploadForm) {
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.uploadFile();
            });
        }
    }

    async uploadFile() {
        const fileInput = document.getElementById('file-input');
        const uploadBtn = document.getElementById('upload-btn');
        const file = fileInput.files[0];
        
        const titleVal = document.getElementById('upload-title')?.value.trim();
        const descVal = document.getElementById('upload-desc')?.value.trim();
        const catVal = document.getElementById('upload-category')?.value;
        const tagsVal = document.getElementById('upload-tags')?.value.trim();

        if (!file || !titleVal || !catVal) {
            alert('Please select a file, provide a title, and select a category.');
            return;
        }

        try {
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Uploading...';

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Please login first!');

            // Generate Path: userId/timestamp_filename
            const filePath = `${user.id}/${Date.now()}_${file.name}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(this.bucketName)
                .upload(filePath, file);

            if (error) throw error;

            // Get Public URL
            const { data: publicData } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            // parse tags
            const tagsArray = tagsVal ? tagsVal.split(',').map(t => t.trim()).filter(Boolean) : [];
            // determine extension type trivially
            const ext = file.name.split('.').pop().toLowerCase();
            let fileTypeStr = 'html';
            if (ext === 'md') fileTypeStr = 'markdown';
            if (ext === 'mp4') fileTypeStr = 'video';
            if (ext === 'mp3') fileTypeStr = 'audio';

            // Record in files table
            const { error: dbError } = await supabase.from('files').insert({
                owner_id: user.id,
                filename: file.name,
                file_url: publicData.publicUrl,
                is_public: true,
                title: titleVal,
                description: descVal,
                category: catVal,
                tags: tagsArray,
                file_type: fileTypeStr,
                is_approved: false
            });

            if (dbError) console.error('Error saving file record:', dbError);

            // Add EXP / Track Action
            await trackActivity(user.id, 'upload_file', 10);

            alert('Upload successful! It will be visible on the main page once approved by an Admin.');
            
            // Reset state
            document.getElementById('upload-form').reset();
            document.getElementById('file-selected-name').classList.add('hidden');
            await this.fetchMyFiles();
            await this.fetchPendingFiles(); // refresh admin view just in case

        } catch (error) {
            console.error(error);
            alert('Upload failed: ' + error.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Submit to Nexus';
        }
    }

    async fetchMyFiles() {
        const container = document.getElementById('file-list-container');
        if (!container) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: files, error } = await supabase
                .from('files')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!files || files.length === 0) {
                container.innerHTML = '<div class="text-center py-10 text-slate-500">尚無檔案，快去上傳吧！</div>';
                return;
            }

            container.innerHTML = files.map(file => `
                <div class="bg-slate-800/50 rounded-xl p-4 flex justify-between items-center group border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="p-2 bg-slate-700/50 rounded-lg text-slate-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div class="truncate">
                            <h4 class="text-white font-medium text-sm truncate" title="${file.filename}">${file.filename}</h4>
                            <span class="text-xs text-slate-500">${new Date(file.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="navigator.clipboard.writeText('${file.file_url}'); alert('已複製分享連結！');" class="p-2 text-slate-400 hover:text-blue-400 bg-slate-800 rounded-lg hover:bg-slate-700 transition" title="複製連結分享">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                        </button>
                        <a href="${file.file_url}" target="_blank" class="p-2 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-lg hover:bg-slate-700 transition" title="下載/開啟">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </a>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error fetching files:', error);
            container.innerHTML = '<div class="text-center py-10 text-red-500">Failed to load files</div>';
        }
    }

    async checkAdminAndInit() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();
                
            if (profile && profile.role === 'admin') {
                const adminPanel = document.getElementById('admin-approval-panel');
                if (adminPanel) adminPanel.classList.remove('hidden');
                this.fetchPendingFiles();
            }
        } catch(e) {
            console.error('Admin check failed:', e);
        }
    }

    async fetchPendingFiles() {
        const container = document.getElementById('admin-pending-list');
        if (!container) return;

        try {
            const { data: files, error } = await supabase
                .from('files')
                .select('*')
                .eq('is_approved', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!files || files.length === 0) {
                container.innerHTML = '<div class="text-center py-6 text-zinc-500 text-sm">No pending files securely identified.</div>';
                return;
            }

            container.innerHTML = files.map(file => `
                <div class="bg-zinc-800/50 rounded-xl p-4 flex justify-between items-center border border-rose-900/40">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="p-2 bg-rose-900/20 rounded-lg text-rose-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <div class="truncate">
                            <h4 class="text-white font-medium text-sm truncate" title="${file.title || file.filename}">${file.title || file.filename} <span class="text-xs ml-1 bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">${file.category || 'misc'}</span></h4>
                            <span class="text-xs text-zinc-500">${file.description || ''}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                         <a href="${file.file_url}" target="_blank" class="text-xs px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition" title="Preview">Preview</a>
                         <button onclick="if(window.fileManager) window.fileManager.approveFile('${file.id}')" class="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition" title="Approve">Approve</button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error fetching pending files:', error);
            container.innerHTML = '<div class="text-center py-4 text-red-500">Error loading pending files</div>';
        }
    }

    async approveFile(fileId) {
        if (!confirm('Are you sure you want to approve this module to be visible to the public?')) return;
        try {
            const { error } = await supabase
                .from('files')
                .update({ is_approved: true })
                .eq('id', fileId);
            
            if (error) throw error;
            alert('File approved successfully.');
            this.fetchPendingFiles();
        } catch (error) {
            console.error('Error approving file:', error);
            alert('Approval failed: ' + error.message);
        }
    }
}

// Global initialization
if (typeof window !== 'undefined') {
    window.onload = () => {
        if (document.getElementById('file-list-container')) {
            window.fileManager = new FileManager();
        }
    }
}
