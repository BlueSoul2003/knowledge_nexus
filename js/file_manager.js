import { supabase } from './supabase_client.js';
import { trackActivity } from './activity_tracker.js';

class FileManager {
    constructor() {
        this.bucketName = 'user_files';
        this.initEventListeners();
        this.fetchMyFiles();
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

        if (!file) {
            alert('請先選擇檔案');
            return;
        }

        try {
            uploadBtn.disabled = true;
            uploadBtn.textContent = '上傳中...';

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('請先登入！');

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

            // Record in files table
            const { error: dbError } = await supabase.from('files').insert({
                owner_id: user.id,
                filename: file.name,
                file_url: publicData.publicUrl,
                is_public: true
            });

            if (dbError) console.error('Error saving file record:', dbError);

            // Add EXP / Track Action
            await trackActivity(user.id, 'upload_file', 10);

            alert('上傳成功！你獲得了 10 EXP。');
            
            // Reset state
            document.getElementById('upload-form').reset();
            document.getElementById('file-selected-name').classList.add('hidden');
            await this.fetchMyFiles();

        } catch (error) {
            console.error(error);
            alert('上傳失敗: ' + error.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = '開始上傳';
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
            container.innerHTML = '<div class="text-center py-10 text-red-500">載入失敗</div>';
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
