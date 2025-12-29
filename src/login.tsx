import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const IconEye = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
    />
  </svg>
);

const IconEyeOff = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      fill="currentColor"
      d="M2 5.27 3.28 4 20 20.72 18.73 22l-3.2-3.2A11.58 11.58 0 0 1 12 19C5 19 2 12 2 12a18.85 18.85 0 0 1 4.1-5.57L2 5.27Zm8.83 3.54a4 4 0 0 1 4.36 4.36l-4.36-4.36ZM12 7c7 0 10 7 10 7a18.92 18.92 0 0 1-4.54 5.72l-1.42-1.42A11.83 11.83 0 0 0 20 12s-3-7-8-7a11.83 11.83 0 0 0-4.3.8l-1.5-1.5A13.68 13.68 0 0 1 12 7Z"
    />
  </svg>
);

interface Credentials {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();

  // Try to load saved credentials from localStorage (if any)
  const savedUser = localStorage.getItem("user");
  const parsedUser: Credentials | null = savedUser
    ? JSON.parse(savedUser)
    : null;

  const [form, setForm] = useState<Credentials>({
    email: parsedUser?.email || "",
    password: parsedUser?.password || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(!!parsedUser);

  // Auto-login if saved user info is present
  useEffect(() => {
    if (parsedUser) {
      handleAutoLogin(parsedUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAutoLogin = async (_savedCredentials: Credentials) => {
    setLoading(true);
    setError(null);
    // Simulate async login (you should replace with real API call)
    try {
      // Add your login logic here
      await new Promise((r) => setTimeout(r, 1000));
      navigate("/onboard");
    } catch {
      setError("Auto-login failed. Please sign in manually.");
      localStorage.removeItem("user");
      setRemember(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    const emailOk = /\S+@\S+\.\S+/.test(form.email);
    if (!emailOk) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((r) => setTimeout(r, 1000));

      if (remember) {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...form, username: form.email })
        );
      } else {
        localStorage.removeItem("user");
      }

      navigate("/onboard");
    } catch {
      setError("Wrong email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden text-gray-100 bg-[#0b0c10] select-none">
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src="https://xboxwire.thesourcemediaassets.com/sites/2/2020/08/FortniteS4_HERO.jpg"
          alt="Chapter 2 Season 4 Background"
          className="w-full h-full object-cover opacity-40 pointer-events-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      </div>

      {/* CENTERED LOGIN CARD */}
      <div className="relative flex flex-col items-center justify-center h-full pointer-events-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8"
          role="main"
          aria-label="Login form"
        >
          <div className="flex flex-col items-center space-y-4 mb-6">
            <img
              src="https://i.ibb.co/wF5sQDN2/nexus.png"
              alt="Nexus Logo"
              className="h-12"
              draggable={false}
            />
            <h1 className="text-2xl font-semibold tracking-wide">Sign In</h1>
            <p className="text-gray-400 text-sm">
              to continue to the Nexus War Launcher
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="text-sm text-gray-300 font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="mt-1 w-full rounded-lg bg-[#141414] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                required
                aria-invalid={!!error}
                aria-describedby="email-error"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm text-gray-300 font-medium"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-[#141414] border border-white/10 px-4 py-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  minLength={6}
                  required
                  aria-invalid={!!error}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={() => setRemember((r) => !r)}
                className="w-4 h-4 rounded border border-gray-600 bg-[#141414] text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-300 select-none cursor-pointer">
                Remember me
              </label>
            </div>

            {error && (
              <p
                id="form-error"
                className="text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg p-2"
                role="alert"
              >
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-700 to-blue-500 shadow-lg hover:from-blue-600 hover:to-blue-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              aria-live="polite"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <div className="mt-6 flex justify-between text-sm text-gray-400">
            <button
              type="button"
              className="hover:text-white transition underline focus:outline-none"
              onClick={() => alert("Password recovery flow coming soon!")}
            >
              Forgot Password?
            </button>
            <button
              type="button"
              className="hover:text-white transition underline focus:outline-none"
              onClick={() => alert("Account creation flow coming soon!")}
            >
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
