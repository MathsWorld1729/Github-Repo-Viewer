// Configuration object
const config = {
    repository: {
        owner: "",
        name: "",
        branch: "main",
        excludedFiles: [
            "index.html",
            "README.md",
            "LICENSE",
            "CNAME",
            "favicon_io",
            "styles.css",
            "script.js"
        ]
    },
    theme: {
        default: 'light',
        storageKey: 'theme'
    }
};

// Repository settings form
function showRepoSettings() {
    const currentContent = document.getElementById('repoContents').innerHTML;
    document.getElementById('repoContents').innerHTML = `
        <div class="settings-container">
            <h3>Repository Settings</h3>
            <form id="repoSettingsForm" class="settings-form">
                <div class="form-group">
                    <label for="repoOwner">Repository Owner:</label>
                    <input type="text" id="repoOwner" value="${config.repository.owner}" placeholder="e.g., username" required>
                </div>
                <div class="form-group">
                    <label for="repoName">Repository Name:</label>
                    <input type="text" id="repoName" value="${config.repository.name}" placeholder="e.g., my-repo" required>
                </div>
                <div class="form-group">
                    <label for="repoBranch">Branch:</label>
                    <input type="text" id="repoBranch" value="${config.repository.branch}" placeholder="e.g., main">
                </div>
                <div class="form-actions">
                    <button type="submit" class="settings-button">Save & Load</button>
                    <button type="button" class="settings-button cancel" onclick="loadRepo()">Cancel</button>
                    <button type="button" class="settings-button clear" onclick="clearRepoFields()">Clear</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('repoSettingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateRepoSettings();
    });
}

function clearRepoFields() {
    document.getElementById('repoOwner').value = '';
    document.getElementById('repoName').value = '';
    document.getElementById('repoBranch').value = 'main';
}

function updateRepoSettings() {
    const owner = document.getElementById('repoOwner').value.trim();
    const name = document.getElementById('repoName').value.trim();
    const branch = document.getElementById('repoBranch').value.trim();

    if (owner && name) {
        config.repository.owner = owner;
        config.repository.name = name;
        config.repository.branch = branch || 'main';
        
        // Save settings to localStorage
        localStorage.setItem('repoConfig', JSON.stringify(config.repository));
        
        // Reload repository contents
        loadRepo();
    }
}

// Theme functions
function initializeTheme() {
    const savedTheme = localStorage.getItem(config.theme.storageKey) || config.theme.default;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    const themeText = document.querySelector('.theme-text');
    
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem(config.theme.storageKey, newTheme);
    updateThemeButton(newTheme);
}

// Function to get file extension
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// Function to get appropriate icon for file type
function getFileIcon(filename) {
    const ext = getFileExtension(filename);
    const icons = {
        pdf: '📄',
        doc: '📝',
        docx: '📝',
        txt: '📝',
        jpg: '🖼️',
        jpeg: '🖼️',
        png: '🖼️',
        gif: '🖼️',
        mp4: '🎥',
        mov: '🎥',
        zip: '📦',
        default: '📄'
    };
    return icons[ext] || icons.default;
}

// Function to check if file is an image
function isImage(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageExtensions.includes(getFileExtension(filename));
}

// PDF handling functions
async function renderPDFPreview(url, container) {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        // Calculate scale to fit the container width (250px card width - 40px padding)
        const containerWidth = 210;
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        canvas.classList.add('pdf-preview-canvas');
        
        await page.render({
            canvasContext: context,
            viewport: scaledViewport
        }).promise;
        
        container.innerHTML = '';
        container.appendChild(canvas);
    } catch (error) {
        console.error('Error generating PDF preview:', error);
        container.innerHTML = `
            <div class="preview-placeholder">
                📄
                <div class="preview-error">Preview not available</div>
            </div>
        `;
    }
}

async function loadRepo(path = '') {
    const { owner, name, excludedFiles } = config.repository;

    // Show default page if no repository is configured
    if (!owner || !name) {
        document.getElementById('repoContents').innerHTML = `
            <div class="default-container">
                <div class="github-brand">
                    <svg class="github-logo" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/>
                    </svg>
                    <h1 class="github-title">GitHub Repo Viewer</h1>
                </div>
                <p class="github-description">Visualize and explore public GitHub repositories<br>with beautiful previews and easy navigation</p>
                <button onclick="showRepoSettings()" class="settings-button cta-button">
                    🚀 Get Started
                </button>
            </div>
        `;
        return;
    }

    const baseUrl = `https://${owner}.github.io/${name}`;
    const apiUrl = `https://api.github.com/repos/${owner}/${name}/contents/${path}`;

    document.getElementById('repoContents').innerHTML = '<p class="loading">Loading repository contents...</p>';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Repository not found');
        const data = await response.json();

        let contentHtml = `
            <div class="repo-header">
                <h3>${owner}/${name}</h3>
                <div class="repo-actions">
                <button onclick="showRepoSettings()" class="settings-button">
                    ⚙️ Change Repository
                </button>
                <button onclick="clearLocalStorage()" class="settings-button clear-storage">
                    🗑️ Clear Local Storage
                </button>
                </div>
            </div>
            <div class="content-grid">
        `;

        if (path) {
            const parentPath = path.split('/').slice(0, -1).join('/');
            contentHtml = `
                <div class="breadcrumb">
                    <a href="#" class="back-button" onclick="loadRepo('${parentPath}')">
                        ⬅️ Back
                    </a>
                    <span>/${path}</span>
                </div>
                ${contentHtml}
            `;
        }

        // Filter and sort the items
        const filteredData = data.filter(item => !excludedFiles.includes(item.name));

        for (const item of filteredData) {
            const fileUrl = item.type === 'dir' ? '#' : `${baseUrl}/${item.path}`;
            
            const isPDF = item.name.toLowerCase().endsWith('.pdf');
            const onClick = item.type === 'dir' 
                ? `onclick="loadRepo('${item.path}')"` 
                : (isPDF ? '' : `onclick="window.open('${fileUrl}', '_blank')"`);

            let previewHtml = '';
            if (item.type === 'file') {
                if (isImage(item.name)) {
                    previewHtml = `
                        <div class="card-preview">
                            <img src="${fileUrl}" alt="${item.name}" loading="lazy">
                        </div>
                    `;
                } else if (isPDF) {
                    previewHtml = `
                        <div class="card-preview">
                            <div class="pdf-preview-container" id="pdf-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}">
                                <div class="preview-placeholder">
                                    <div class="loading-spinner"></div>
                                    Loading preview...
                                </div>
                            </div>
                            <div class="pdf-preview-actions">
                                <button class="pdf-action-button" onclick="window.open('${fileUrl}', '_blank')">
                                    ↗️ Open PDF
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    previewHtml = `
                        <div class="preview-placeholder">
                            ${getFileIcon(item.name)}
                        </div>
                    `;
                }
            }

            contentHtml += `
                <div class="card" ${onClick}>
                    <div class="card-title">
                        <span class="card-icon">${item.type === 'dir' ? '📁' : getFileIcon(item.name)}</span>
                        <span>${item.name}</span>
                    </div>
                    ${previewHtml}
                    <span class="file-badge">${item.type === 'dir' ? 'Folder' : getFileExtension(item.name).toUpperCase()}</span>
                </div>
            `;
        }
        contentHtml += '</div>';

        document.getElementById('repoContents').innerHTML = contentHtml;

        // Render PDF previews after the content is added to DOM
        for (const item of filteredData) {
            if (item.type === 'file' && item.name.toLowerCase().endsWith('.pdf')) {
                const containerId = `pdf-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const container = document.getElementById(containerId);
                if (container) {
                    const fileUrl = `${baseUrl}/${item.path}`;
                    renderPDFPreview(fileUrl, container);
                }
            }
        }
    } catch (error) {
        console.error(error);
        document.getElementById('repoContents').innerHTML = `
            <div class="error-container">
                <p>Error loading repository. Please check if:</p>
                <ul>
                    <li>The repository exists and is public</li>
                    <li>GitHub Pages is enabled for this repository</li>
                    <li>The repository owner and name are correct</li>
                </ul>
                <button onclick="showRepoSettings()" class="settings-button">
                    ⚙️ Check Repository Settings
                </button>
            </div>
        `;
    }
}

// Function to clear local storage
function clearLocalStorage() {
    localStorage.removeItem('repoConfig');
    config.repository.owner = '';
    config.repository.name = '';
    config.repository.branch = 'main';
    console.log('Local storage cleared.');
    alert('Local storage has been cleared.');
    loadRepo(); // Reload the default page
}

// Initialize application
function initializeApp() {
    // Load saved repository settings if they exist
    const savedConfig = localStorage.getItem('repoConfig');
    if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        Object.assign(config.repository, parsedConfig);
    }

    initializeTheme();
    loadRepo();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);