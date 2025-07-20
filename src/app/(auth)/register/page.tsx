"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (formData.displayName.length < 3) {
      setError("Display name must be at least 3 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password, {
      username: formData.username,
      display_name: formData.displayName,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/home");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold font-unbounded text-white mb-6">
            Create account
          </h2>

          <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500 rounded-md">
            <p className="text-sm text-white mb-3">
              If you do not want to create your own account you can log into the
              application as a guest by using the credentials
            </p>
            <div className="text-sm">Email: guest@guest.com</div>
            <div className="text-sm mb-4">Password: guestpassword</div>

            <div className="flex justify-center">
              <Link
                href="/login"
                className="px-3 py-1 bg-orange-500 hover:bg-orange-400 text-white text-sm rounded transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded flex justify-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Email"
            />

            <input
              type="text"
              name="username"
              required
              minLength={3}
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Username (min. 3 characters)"
            />

            <input
              type="text"
              name="displayName"
              required
              minLength={3}
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Display Name (min. 3 characters)"
            />

            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Password (min. 6 characters)"
            />

            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Confirm Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-400 rounded-md text-white font-medium disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-orange-500 hover:text-orange-400"
            >
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
