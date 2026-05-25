import { useState, useEffect } from 'react'
import './About.css'
import SplitText from '@/components/SplitText'
import { categories } from '@/lib/api'
import { 
  Code2, 
  Heart, 
  Terminal,
  Cpu,
  Globe,
  Database,
  Wrench,
  User,
  Settings,
  FileCode2,
  List,
  MessageSquare
} from 'lucide-react'

export default function About() {
  const [activeTab, setActiveTab] = useState<'user' | 'dev'>('user')

  // always scroll to top when page renders
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="about-wrapper pb-10">
      {/* Header Section */}
      <div className="about-header-centered">
        <SplitText
          text="about critterFX!"
          className="about-title"
          delay={20}
          duration={1.5}
          ease="elastic.out(1, 0.3)"
          splitType="chars"
          from={{ opacity: 0, y: 5 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />
      </div>

      <div className="flex gap-4 mb-2">
        <button 
          className={`about-tab-btn ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          <User size={18} /> user guide
        </button>
        <button 
          className={`about-tab-btn ${activeTab === 'dev' ? 'active' : ''}`}
          onClick={() => setActiveTab('dev')}
        >
          <Code2 size={18} /> dev docs
        </button>
      </div>

      {activeTab === 'user' ? (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">

          <div className="about-info-section">
            <div className="about-section-header">
              <h2 className="about-section-title flex items-center gap-2">how to use</h2>
              <p className="text-sm text-muted-foreground mt-1">its simple :D</p>
            </div>
            <div className="about-content mt-2 space-y-4 text-sm text-muted-foreground">
              <p>
                1. <strong>configure settings:</strong> critterFX automatically scans your AE filepath, but if you want to change these filepaths, your are welcome to do so..
              </p>
              <p>
                2. <strong>browse presets:</strong> head over to the preset page to find presets shared by the community.
              </p>
              <p>
                3. <strong>download & apply:</strong> click download on any preset. they will be saved to your scanned AE preset folder automatically!
              </p>
              <p>
                4. <strong>share your own:</strong> go to the upload tab to share your creations with the community.
              </p>
            </div>
          </div>

          <div className="about-info-section">
            <div className="about-section-header">
              <h2 className="about-section-title flex items-center gap-2">
                <Heart size={18} /> thank you for looking at this app!
              </h2>
            </div>
            <div className="about-content mt-4">
              <p className="about-description">
                tired of terribly overpriced editing resources? 
                critterFX is a free and open source platform to browse and upload your own presets, seamlessly installing them to After Effects with a stupid easy process.
              </p>
            </div>
          </div>

          <div className="about-features-grid">
            <div className="about-feature-card">
              <Cpu size={24} className="mb-2 text-primary/80" />
              <h3>its fast</h3>
              <p>nothing bloating this app</p>
            </div>
            <div className="about-feature-card">
              <Globe size={24} className="mb-2 text-primary/80" />
              <h3>everythings free!</h3>
              <p>I LOVE FREE STUFF! :D</p>
            </div>
            <div className="about-feature-card">
              <Heart size={24} className="mb-2 text-primary/80" />
              <h3>open source</h3>
              <p>made for the community</p>
            </div>
          </div>


        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="about-stats">
            <div className="about-stat-card">
              <Terminal size={20} className="about-stat-icon" />
              <span className="about-stat-value">tauri</span>
              <span className="about-stat-label">rust backend</span>
            </div>
            <div className="about-stat-card">
              <Code2 size={20} className="about-stat-icon" />
              <span className="about-stat-value">react</span>
              <span className="about-stat-label">typescript + tailwind</span>
            </div>
            <div className="about-stat-card">
              <Database size={20} className="about-stat-icon" />
              <span className="about-stat-value">supabase</span>
              <span className="about-stat-label">database & auth</span>
            </div>
            <div className="about-stat-card">
              <Wrench size={20} className="about-stat-icon" />
              <span className="about-stat-value">shadcn</span>
              <span className="about-stat-label">ui components</span>
            </div>
          </div>

          <div className="about-info-section">
            <div className="about-section-header">
              <h2 className="about-section-title flex items-center gap-2"><Settings className="w-5 h-5"/> setup guide</h2>
              <p className="text-sm text-muted-foreground mt-1">everything you need to get critterFX running locally.</p>
            </div>
            <div className="about-content mt-4 space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">1. install prerequisites</h3>
                <div className="text-sm text-muted-foreground">
                  <p>you need node.js and rust installed on your system.</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>node.js:</strong> download from <a href="https://nodejs.org/" target="_blank" rel="noreferrer" className="text-primary hover:underline">nodejs.org</a></li>
                    <li><strong>rust:</strong> run the following in your terminal or download from <a href="https://rustup.rs/" target="_blank" rel="noreferrer" className="text-primary hover:underline">rustup.rs</a>
                      <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                        <code>curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</code>
                      </pre>
                    </li>
                    <li><strong>OR:</strong> use winget
                      <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                        <code>winget install Rustlang.Rustup</code>
                      </pre>
                    </li>
                    <li><strong>tauri CLI dependencies:</strong> check the <a href="https://v2.tauri.app/start/prerequisites/" target="_blank" rel="noreferrer" className="text-primary hover:underline">tauri prereqs guide</a> for OS-specific requirements.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">2. supabase setup</h3>
                <div className="text-sm text-muted-foreground">
                  <p>i use supabase for authentication and data storage.</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>create a project at <a href="https://supabase.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">supabase.com</a></li>
                    <li>set up an authentication provider (email/password or discord/google).</li>
                    <li>create the necessary tables (presets, users, etc.) in the SQL editor.</li>
                    <li>create a storage bucket for preset files (and pfp images/other stuff if you want).</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">3. API keys & environment variables</h3>
                <div className="text-sm text-muted-foreground">
                  <p>create a <code>.env</code> file in the root of the project and add your supabase keys:</p>
                  <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                    <code>
VITE_SUPABASE_URL=your_project_url{'\n'}
VITE_SUPABASE_ANON_KEY=your_anon_key{'\n'}
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
                    </code>
                  </pre>
                  <p className="mt-2 text-xs italic">note: Never commit your <code>.env</code> file!</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">4. run the project</h3>
                <div className="text-sm text-muted-foreground">
                  <p>install frontend dependencies and start the tauri dev server:</p>
                  <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                    <code>
npm install{'\n'}
npm run tauri dev
                    </code>
                  </pre>
                  <p className="mt-2">this will start the vite dev server and open the tauri desktop window.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileCode2 size={16} /> 5. preset interface
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>the Preset interface in critterFX:</p>
                  <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                    <code>{`interface Preset {
  id: string
  created_at: string
  user_id: string
  author_name: string
  name: string
  description: string
  category: string
  file_name: string
  file_url: string
  preview_gif_url?: string
  ae_version?: string
  download_count: number
  is_approved: boolean
  is_featured: boolean
}`}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <List size={16} /> 6. categories
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>available preset categories and their icons:</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center gap-2 bg-muted/50 p-2 rounded border border-border/30">
                        <span className="font-mono text-[10px] text-primary">{cat.id}</span>
                        <span className="text-[10px] opacity-70">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare size={16} /> 7. comment interface
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>the Comment interface in critterFX:</p>
                  <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                    <code>{`type Comment = {
  id: string
  created_at: string
  preset_id: string
  user_id: string
  author_name: string
  content: string
  edited_at?: string | null
}`}</code>
                  </pre>
                </div>
                    <div className="text-sm text-muted-foreground">
                      <p>i suggest looking at <code>api.ts</code> to get more information.</p>
                    </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Terminal size={16} /> 8. backend architecture
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>the backend is built with rust using tauri, handling the file system management and executing elevated commands.</p>
                  
                  <h4 className="font-semibold mt-4 mb-2 text-foreground">core structures in `src-tauri/src/main.rs`</h4>
                  <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                    <code>{`#[derive(Debug, Serialize, Deserialize, Clone)]
struct AEInstallation {
    version: String,
    scripts_path: String,
    user_presets_path: String,
    exists: bool,
}`}</code>
                  </pre>
                  <p className="mt-2 text-xs italic">stores information about a detected after effects installation.</p>

                  <pre className="bg-muted text-foreground p-3 rounded-md mt-4 overflow-x-auto font-mono text-xs border border-border/50">
                    <code>{`#[derive(Debug, Serialize, Deserialize)]
struct PathConfig {
    custom_scripts_path: Option<String>,
    custom_presets_path: Option<String>,
    custom_composition_path: Option<String>,
}`}</code>
                  </pre>
                  <p className="mt-2 text-xs italic">manages user-defined custom paths for scripts, presets, and compositions.</p>

                  <h4 className="font-semibold mt-6 mb-2 text-foreground">tauri commands exposed to frontend</h4>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>`scan_ae_installations`</strong>: automatically scans the system to find valid after effects script and user preset directories.</li>
                    <li><strong>`get_path_config` / `save_path_config`</strong>: reads from and writes to the local `path_config.json` file.</li>
                    <li><strong>`verify_path`</strong>: a utility command to check if a provided directory path actually exists on the filesystem.</li>
                    <li><strong>`install_preset`</strong>: the main command for installing downloaded assets. it dynamically determines the correct destination based on the preset type.</li>
                    <li><strong>`write_binary_file`</strong>: allows the frontend to write raw byte arrays to temporary files before they are installed.</li>
                  </ul>

                  <h4 className="font-semibold mt-6 mb-2 text-foreground">privilege escalation (windows)</h4>
                  <p>installing `.jsx` scripts often requires writing to the `C:\Program Files` directory, which requires administrator privileges on windows. the backend handles this nicely:</p>
                  <ol className="list-decimal pl-6 space-y-1 mt-2">
                    <li>`install_preset` first attempts a standard file copy.</li>
                    <li>if it fails due to permission errors, it falls back to a custom `request_admin_and_copy` function:</li>
                  </ol>
                  <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                    <code>{`#[cfg(windows)]
fn request_admin_and_copy(source: &str, dest: &str) -> Result<(), String> {
    use std::process::Command;
    use std::os::windows::process::CommandExt;
    
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let output = Command::new("powershell")
        .args(&[
            "-NonInteractive",
            "-NoProfile", 
            "-WindowStyle", "Hidden",
            "-Command",
            &format!(
                "Start-Process powershell -Verb RunAs -Wait -WindowStyle Hidden -ArgumentList '-NonInteractive -NoProfile -WindowStyle Hidden -Command \\"Copy-Item -Path ''{}'' -Destination ''{}'' -Force\\"'",
                source, dest
            )
        ])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(format!("copy failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}`}</code>
                  </pre>
                  <p className="mt-2">this function spawns a hidden powershell process using `-Verb RunAs` to prompt the user for UAC elevation and performs the copy with admin rights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="about-footer">
        <p>made by crittercast</p>
      </div>
    </div>
  )
}
