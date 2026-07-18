import React, { useState, useEffect } from "react";
import { 
  Lock, Mail, User, Sparkles, Database, CheckCircle2, 
  AlertCircle, ArrowRight, Eye, EyeOff, Key, ShieldCheck,
  RefreshCw, Terminal, ExternalLink, Settings
} from "lucide-react";
import { 
  getSupabaseClient, 
  isSupabaseConfigured, 
  getSupabaseCredentials, 
  saveSupabaseOverride 
} from "../lib/supabase";

interface LoginScreenProps {
  onLoginSuccess: (user: { email: string; name: string; isSimulated: boolean }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Credentials override management
  const [configured, setConfigured] = useState(isSupabaseConfigured());
  const [creds, setCreds] = useState(getSupabaseCredentials());
  const [showConsole, setShowConsole] = useState(false);
  const [inputUrl, setInputUrl] = useState(creds.url);
  const [inputAnonKey, setInputAnonKey] = useState(creds.anonKey);
  
  // Toggle Sandbox Mode
  const [useSandbox, setUseSandbox] = useState(() => {
    const saved = localStorage.getItem("auth_use_sandbox");
    if (saved !== null) {
      return saved === "true";
    }
    return !isSupabaseConfigured();
  });

  const handleToggleSandbox = (val: boolean) => {
    setUseSandbox(val);
    localStorage.setItem("auth_use_sandbox", String(val));
  };
  
  // User messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Check if Supabase session is already active
    const checkSession = async () => {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { data, error } = await supabase.auth.getSession();
            if (!error && data?.session?.user) {
              const user = data.session.user;
              onLoginSuccess({
                email: user.email || "",
                name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Supabase User",
                isSimulated: false,
              });
            }
          } catch (e) {
            console.error("Session check failed", e);
          }
        }
      }
    };
    checkSession();
  }, [configured]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    if (isSignUp && !fullName) {
      setErrorMsg("Full name is required for registration.");
      return;
    }

    setLoading(true);

    if (!useSandbox && configured) {
      // 🚀 REAL SUPABASE AUTHENTICATION
      const supabase = getSupabaseClient();
      if (!supabase) {
        setErrorMsg("Supabase client is not initialized.");
        setLoading(false);
        return;
      }

      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              }
            }
          });

          if (error) throw error;

          if (data.user) {
            // Check if confirmation email is required
            if (data.session) {
              setSuccessMsg("Account created and logged in!");
              onLoginSuccess({
                email: data.user.email || "",
                name: fullName || "Supabase User",
                isSimulated: false,
              });
            } else {
              setSuccessMsg("Registration successful! Please check your email inbox to confirm your account.");
              // Fall back to login view
              setIsSignUp(false);
            }
          }
        } else {
          // Login
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user && data.session) {
            onLoginSuccess({
              email: data.user.email || "",
              name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
              isSimulated: false,
            });
          }
        }
      } catch (err: any) {
        console.error("Supabase Auth error:", err);
        setErrorMsg(err.message || "Authentication failed. Double check your credentials.");
      } finally {
        setLoading(false);
      }

    } else {
      // 🧪 SIMULATED LOCAL AUTOPILOT AUTH
      // For developer convenience and zero friction
      setTimeout(() => {
        try {
          if (isSignUp) {
            // Store registration simulated user in localStorage
            const simulatedUsers = JSON.parse(localStorage.getItem("simulated_users") || "[]");
            if (simulatedUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
              setErrorMsg("An account with this email already exists in Sandbox.");
              setLoading(false);
              return;
            }

            const newUser = { email, name: fullName, password };
            simulatedUsers.push(newUser);
            localStorage.setItem("simulated_users", JSON.stringify(simulatedUsers));

            setSuccessMsg("Sandbox account registered successfully!");
            setTimeout(() => {
              onLoginSuccess({
                email,
                name: fullName,
                isSimulated: true,
              });
            }, 800);
          } else {
            // Login check
            const simulatedUsers = JSON.parse(localStorage.getItem("simulated_users") || "[]");
            // Default built-in simulated user
            const defaultUser = { email: "admin@nova.ai", name: "Amit Sharma", password: "password" };
            
            const matchedUser = simulatedUsers.find(
              (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            ) || (email.toLowerCase() === defaultUser.email && password === defaultUser.password ? defaultUser : null);

            if (matchedUser) {
              setSuccessMsg("Welcome back to NovaOS!");
              setTimeout(() => {
                onLoginSuccess({
                  email: matchedUser.email,
                  name: matchedUser.name,
                  isSimulated: true,
                });
              }, 800);
            } else {
              setErrorMsg("Invalid email or password. Hint: Try admin@nova.ai / password or create a new sandbox account!");
            }
          }
        } catch (e) {
          console.error(e);
          setErrorMsg("Failed to complete local simulation auth.");
        } finally {
          setLoading(false);
        }
      }, 1000);
    }
  };

  const handleSaveCredentialsOverride = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseOverride(inputUrl, inputAnonKey);
    const updatedConfigured = isSupabaseConfigured();
    setConfigured(updatedConfigured);
    setCreds(getSupabaseCredentials());
    
    if (updatedConfigured) {
      setSuccessMsg("Supabase client initialized successfully with override credentials!");
      setErrorMsg("");
      setShowConsole(false);
    } else {
      setErrorMsg("Credentials cleared. Reverting to local simulator sandbox.");
      setSuccessMsg("");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#030303] text-zinc-100 relative overflow-hidden font-sans select-none">
      
      {/* Background Decorative Circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      
      {/* Container holding form and console */}
      <div className="w-full max-w-md p-6 z-10">
        
        {/* Core Auth Panel Card */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative space-y-6">
          
          {/* Logo brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/10 text-white font-black text-xl mb-2 animate-pulse">
              ▲
            </div>
            <h1 className="text-xl font-black font-display tracking-tight text-white flex items-center justify-center gap-1.5">
              NovaOS Core Login
            </h1>
            <p className="text-xs text-zinc-400">
              Unified enterprise intelligence & customer billing workspace.
            </p>
          </div>

          {/* Feedback Status */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Success</span>
                <span className="text-[11px] leading-relaxed block text-emerald-500/90">{successMsg}</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Auth Warning</span>
                  <span className="text-[11px] leading-relaxed block text-rose-300">{errorMsg}</span>
                </div>
              </div>
              
              {!useSandbox && (
                <div className="mt-1.5 pt-2 border-t border-rose-500/15 flex flex-col gap-1 text-left">
                  <p className="text-[10px] text-rose-300/85 leading-normal">
                    Trouble connecting to your cloud database? Switch to Sandbox Mode to instantly log in with preconfigured admin credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleSandbox(true);
                      setErrorMsg("");
                      setSuccessMsg("Switched to Offline Sandbox Mode!");
                    }}
                    className="mt-1 px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/20 rounded-lg text-[10px] font-semibold text-center transition-colors cursor-pointer self-start"
                  >
                    Switch to Sandbox Mode (Instant Bypass)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Real Supabase / Sandbox Mode Status Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-[11px]">
            <div className="flex items-center gap-2">
              <Database className={`w-3.5 h-3.5 ${(!useSandbox && configured) ? "text-emerald-400 animate-pulse" : "text-amber-500"}`} />
              <div className="text-left">
                <p className="font-bold text-zinc-200">
                  {(!useSandbox && configured) ? "SUPABASE CLIENT CONNECTED" : "SANDBOX SIMULATOR ACTIVE"}
                </p>
                <p className="text-[9px] text-zinc-500">
                  {(!useSandbox && configured) ? "Using production database tables" : "Simulating authentication layer"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowConsole(!showConsole)}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded text-[9px] font-mono font-bold text-zinc-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              Config
            </button>
          </div>

          {/* Auth Mode Toggle Tabs (Only if Supabase is configured in the project) */}
          {configured && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 text-[11px]">
              <button
                type="button"
                onClick={() => handleToggleSandbox(false)}
                className={`py-1.5 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                  !useSandbox 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                }`}
              >
                Production (Supabase)
              </button>
              <button
                type="button"
                onClick={() => handleToggleSandbox(true)}
                className={`py-1.5 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                  useSandbox 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                }`}
              >
                Sandbox Mode (Demo)
              </button>
            </div>
          )}

          {/* Auth input form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border border-zinc-850 bg-zinc-900/40 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border border-zinc-850 bg-zinc-900/40 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Password</label>
                {!isSignUp && (
                  <span className="text-[10px] text-zinc-500 hover:text-blue-400 cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl pl-10 pr-10 py-2.5 border border-zinc-850 bg-zinc-900/40 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {isSignUp ? "Creating account..." : "Securing login session..."}
                </>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Access Workspace"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Screen Trigger */}
          <div className="text-center pt-2">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
            >
              {isSignUp ? "Already have an account? Log In" : "Need to register for business? Sign Up"}
            </button>
          </div>

          {useSandbox && (
            <div className="text-center pt-2.5 border-t border-zinc-900 flex flex-col gap-1.5 items-center">
              <span className="text-[10px] text-zinc-500 font-mono">
                Sandbox Credentials: <strong className="text-zinc-400">admin@nova.ai</strong> / <strong className="text-zinc-400">password</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@nova.ai");
                  setPassword("password");
                  setSuccessMsg("Filled sandbox admin credentials!");
                }}
                className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer font-semibold"
              >
                Auto-fill Demo Credentials
              </button>
            </div>
          )}

        </div>

        {/* Credentials Override Console panel */}
        {showConsole && (
          <div className="mt-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 shadow-xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Supabase Connection Manager
              </div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Interactive Config</span>
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Plug in your Supabase project's keys below to transition this sandbox to your own fully functional production environment instantly! You can retrieve these from your Supabase Dashboard &gt; Project Settings &gt; API.
            </p>

            <form onSubmit={handleSaveCredentialsOverride} className="space-y-3">
              <div>
                <label className="block text-[9px] font-mono font-bold text-zinc-400 mb-1">SUPABASE_URL</label>
                <input 
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full text-[10px] font-mono rounded-lg p-2 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-zinc-400 mb-1">SUPABASE_ANON_KEY</label>
                <input 
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputAnonKey}
                  onChange={(e) => setInputAnonKey(e.target.value)}
                  className="w-full text-[10px] font-mono rounded-lg p-2 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button 
                  type="submit"
                  className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10px] rounded-lg cursor-pointer text-center transition-colors"
                >
                  Save & Connect
                </button>
                {(inputUrl || inputAnonKey) && (
                  <button 
                    type="button"
                    onClick={() => {
                      setInputUrl("");
                      setInputAnonKey("");
                      saveSupabaseOverride("", "");
                      setConfigured(false);
                      setCreds(getSupabaseCredentials());
                      setSuccessMsg("Supabase credentials cleared.");
                    }}
                    className="py-1.5 px-3 bg-zinc-900 hover:bg-rose-950/40 text-rose-400 border border-zinc-850 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Clear Keys
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
