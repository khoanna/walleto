"use client";

import React, {useEffect, useState} from "react";
import Image from "next/image";
import useAuth from "@/services/useAuth";
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
import {saveToken} from "@/services/Token";
import {useUserContext} from "@/context";
import {jwtDecode} from "jwt-decode";
import {ADMIN_ROLE, ROLE_KEY} from "@/utils/constant";

type AuthMode = "signIn" | "signUp" | "forgot" | "verify" | "reset";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [currentEmail, setCurrentEmail] = useState<string | undefined>();

  const isLeftDark = mode === "signUp" || mode === "forgot" || mode === "reset";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#080a0d] via-[#0f1419] to-[#080a0d] p-4 transition-colors duration-500">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl min-h-[620px] rounded-3xl overflow-hidden shadow-2xl bg-[#111318] border border-[#2a3441]">
        {/* Left Panel - Logo & Info */}
        <div
          className={`flex flex-col items-center justify-center w-full lg:w-1/2 px-6 sm:px-8 py-8 lg:py-6 transition-all duration-500 ${
            isLeftDark ? "bg-[#0f1419] text-white" : "bg-[#111318] text-white"
          }`}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="mb-4 sm:mb-6"
          />
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">WALLETO</h1>
          <p className="text-sm sm:text-base text-center opacity-80 leading-relaxed max-w-xs">
            Giải pháp tài chính cá nhân
            <br />
            Quản lý tài chính và crypto hiệu quả hơn
          </p>

          {mode === "signIn" && (
            <div className="mt-6 sm:mt-10 text-sm sm:text-base text-center">
              Người mới?{" "}
              <button
                onClick={() => setMode("signUp")}
                className="cursor-pointer text-[#14b8a6] hover:text-[#10b981] hover:underline font-semibold transition-colors">
                Đăng ký ngay
              </button>
            </div>
          )}

          {mode === "signUp" && (
            <div className="mt-6 sm:mt-10 text-sm sm:text-base text-center">
              Đã có tài khoản?{" "}
              <button
                onClick={() => setMode("signIn")}
                className="cursor-pointer text-[#14b8a6] hover:text-[#10b981] hover:underline font-semibold transition-colors">
                Đăng nhập ngay
              </button>
            </div>
          )}

          {(mode === "forgot" || mode === "reset") && (
            <button
              onClick={() => setMode("signIn")}
              className="cursor-pointer mt-6 sm:mt-10 px-6 py-2.5 border border-[#2a3441] rounded-full text-sm sm:text-base hover:bg-[#14b8a6]/10 hover:border-[#14b8a6] transition-all duration-300 hover:scale-105">
              ← Quay lại
            </button>
          )}
        </div>

        {/* Right Panel - Forms */}
        <div
          className={`flex flex-col items-center justify-center w-full lg:w-1/2 px-6 sm:px-10 py-8 lg:py-6 transition-all duration-500 ${
            isLeftDark ? "bg-[#111318] text-white" : "bg-[#0f1419] text-white"
          }`}>
          {mode === "signIn" && <SignIn setMode={setMode} />}

          {mode === "signUp" && <SignUp setMode={setMode} setCurrentEmail={setCurrentEmail} />}
          {mode === "verify" && <VerifyOtp email={currentEmail} setMode={setMode} />}

          {mode === "forgot" && (
            <ForgotPassword setMode={setMode} setCurrentEmail={setCurrentEmail} />
          )}
          {mode === "reset" && <ResetPassword setMode={setMode} currentEmail={currentEmail} />}
        </div>
      </div>
    </div>
  );
}

/* ========================== COMPONENTS ========================== */
const Input = ({
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  placeholder: string;
  type?: string;
  value?: string;
  onChange: (value: string) => void;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-4 py-3 sm:py-3.5 mb-3 sm:mb-4 text-sm sm:text-base rounded-xl
      bg-[#080a0d] text-[#f1f5f9] placeholder:text-[#6b7280]
      border border-[#2a3441] focus:border-[#14b8a6]
      focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/40
      transition-all duration-300 hover:border-[#14b8a6]/60"
  />
);

const Button = ({
  label,
  onClick,
  loading,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="cursor-pointer w-full py-3 sm:py-3.5 mt-2 sm:mt-3 bg-gradient-to-r from-[#14b8a6] to-[#10b981] text-[#0f1419] font-semibold rounded-xl 
    shadow-lg shadow-[#14b8a6]/20 hover:shadow-xl hover:shadow-[#14b8a6]/30 hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95 text-sm sm:text-base">
    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : label}
  </button>
);

// (Using browser alert(), no custom alert prop needed)

/* ---------------- SIGN IN ---------------- */
function SignIn({setMode}: {setMode: (m: AuthMode) => void}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const {refreshUser} = useUserContext() || {};

  const router = useRouter();

  const {login, authLoading} = useAuth();
  const userContext = useUserContext();
  const {setUser} = userContext || {};

  const {refresh} = useAuth();

  const fetchToken = async () => {
    try {
      const data = await refresh();
      const token = data?.data?.token;
      saveToken(token);
      setUser?.(data?.data?.infUser);
      const decodedToken = jwtDecode(token) as unknown as {[ROLE_KEY]: string};
      if (decodedToken[ROLE_KEY] !== ADMIN_ROLE) {
        router.push("/dashboard");
        return;
      }
      router.push("/admin");
    } catch (error) {
      setUser?.(undefined);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  const handleLogin = async () => {
    try {
      const data = await login({email, password});
      saveToken(data?.data?.token);
      setUser?.(data?.data?.infUser);
      const decodedToken = jwtDecode(data?.data?.token) as unknown as {[ROLE_KEY]: string};
      if (decodedToken[ROLE_KEY] !== ADMIN_ROLE) {
        setEmail("");
        setPassword("");
        setError("");
        await refreshUser?.();
        router.push("/dashboard");
        return;
      }
      setEmail("");
      setPassword("");
      setError("");
      await refreshUser?.();
      router.push("/admin");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        window.alert(error.message);
      } else {
        setError("Login failed");
        window.alert("Đăng nhập thất bại");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm text-center">
      <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h2>
      <p className="text-sm opacity-80 mb-6">
        Vui lòng nhập thông tin xác thực của bạn để đăng nhập
      </p>
      <Input placeholder="Email" type="email" value={email} onChange={setEmail} />
      <Input placeholder="Mật khẩu" type="password" value={password} onChange={setPassword} />
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <p
        className="text-xs opacity-80 mb-2 cursor-pointer hover:underline"
        onClick={() => setMode("forgot")}>
        Quên mật khẩu?
      </p>
      <Button label="Đăng nhập" onClick={handleLogin} loading={authLoading} />
    </form>
  );
}

/* ---------------- SIGN UP ---------------- */
function SignUp({
  setMode,
  setCurrentEmail,
}: {
  setMode: (m: AuthMode) => void;
  setCurrentEmail: (email: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const {register, authLoading} = useAuth();

  const handleSignup = async () => {
    try {
      if (password !== confirmPassword) throw new Error("Mật khẩu không khớp");
      if (password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      await register({name, email, password, confirmPassword});

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setCurrentEmail(email);

      window.alert("Đăng ký thành công. Vui lòng kiểm tra email để nhận OTP.");
      setMode("verify");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        window.alert(err.message);
      } else {
        setError("Registration failed");
        window.alert("Đăng ký thất bại");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignup();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm text-center">
      <h2 className="text-2xl font-bold mb-2">Đăng ký</h2>
      <p className="text-sm opacity-80 mb-6">Nhập thông tin để đăng ký.</p>
      <Input placeholder="Tên" value={name} onChange={setName} />
      <Input placeholder="Email" type="email" value={email} onChange={setEmail} />
      <Input placeholder="Mật khẩu" type="password" value={password} onChange={setPassword} />
      <Input
        placeholder="Xác nhận mật khẩu"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <Button label="SIGN UP" onClick={handleSignup} loading={authLoading} />
    </form>
  );
}

/* ---------------- FORGOT PASSWORD ---------------- */
function ForgotPassword({
  setMode,
  setCurrentEmail,
}: {
  setMode: (m: AuthMode) => void;
  setCurrentEmail: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const {forgotPassword, authLoading} = useAuth();

  const handleForgotPassword = async () => {
    try {
      await forgotPassword(email);
      setEmail("");
      setError("");
      setCurrentEmail(email);
      window.alert("OTP đã được gửi. Vui lòng kiểm tra email.");
      setMode("reset");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        window.alert(error.message);
      } else {
        setError("Forgot password request failed");
        window.alert("Yêu cầu quên mật khẩu thất bại");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleForgotPassword();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm text-center">
      <h2 className="text-2xl font-bold mb-2">Quên mật khẩu</h2>
      <p className="text-sm opacity-80 mb-6">Vui lòng nhập email để đặt lại mật khẩu</p>
      <Input placeholder="Email" type="email" value={email} onChange={setEmail} />
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <Button label="QUÊN MẬT KHẨU" onClick={handleForgotPassword} loading={authLoading} />
    </form>
  );
}

/* ---------------- VERIFY OTP ---------------- */
function VerifyOtp({email, setMode}: {email?: string; setMode: (m: AuthMode) => void}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const {confirmOTPRegister, authLoading} = useAuth();

  const handleVerify = async () => {
    if (!email) return;
    try {
      await confirmOTPRegister(email, otp.trim());
      setOtp("");
      setError("");
      window.alert("Xác thực thành công. Bạn có thể đăng nhập.");
      setMode("signIn");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        window.alert(error.message);
      } else {
        setError("Verification failed");
        window.alert("Xác thực thất bại");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm text-center">
      <h2 className="text-2xl font-bold mb-2">Kiểm tra hộp thư của bạn</h2>
      <p className="text-sm opacity-80 mb-6">Vui lòng nhập OTP để tiếp tục</p>
      <Input placeholder="OTP" value={otp} onChange={setOtp} />
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <Button label="XÁC NHẬN" loading={authLoading} onClick={handleVerify} />
    </form>
  );
}

/* ---------------- RESET PASSWORD ---------------- */
function ResetPassword({
  currentEmail,
  setMode,
}: {
  currentEmail?: string;
  setMode: (m: AuthMode) => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");

  const {confirmOTPForgotPassword, authLoading} = useAuth();

  const handleReset = async () => {
    try {
      if (newPassword !== confirmPassword) throw new Error("Mật khẩu không khớp");
      if (newPassword.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      if (!currentEmail) throw new Error("Email không hợp lệ");
      if (!otp) throw new Error("Vui lòng nhập OTP");
      await confirmOTPForgotPassword(currentEmail, otp.trim(), newPassword, confirmPassword);
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setError("");
      window.alert("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
      setMode("signIn");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        window.alert(error.message);
      } else {
        setError("Reset password failed");
        window.alert("Đặt lại mật khẩu thất bại");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleReset();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm text-center">
      <h2 className="text-2xl font-bold mb-2">Đặt lại mật khẩu</h2>
      <p className="text-sm opacity-80 mb-6">Nhập mật khẩu mới</p>
      <Input
        placeholder="Mật khẩu mới"
        type="password"
        value={newPassword}
        onChange={setNewPassword}
      />
      <Input
        placeholder="Xác nhận mật khẩu"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />
      <Input placeholder="OTP" value={otp} onChange={setOtp} />
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <Button label="ĐẶT LẠI" onClick={handleReset} loading={authLoading} />
    </form>
  );
}
