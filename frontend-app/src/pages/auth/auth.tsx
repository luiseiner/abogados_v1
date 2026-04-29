"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Scale, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function LawFirmAuth() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const { login: authLogin } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL;


  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      correo,
      contrasena,
      rememberMe,
    };

    try {
      const response = await axios.post(
        `${API_URL}/capitalfarmer.co/api/v1/login`,
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = response.data;

      if (result && result.access_token) {
        await authLogin(result);
        alert("¡Inicio de sesión exitoso!");
        navigate("/home");
      } else {
        throw new Error("Token no recibido");
      }
    } catch (error) {
      alert("Correo o contraseña incorrectos");
    }
  };

  // Función para manejar el cambio del checkbox
  const handleRememberMeChange = (checked: boolean | "indeterminate") => {
    setRememberMe(checked === true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">
              CapitalFarmer
            </span>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10 h-12  border-slate-300 focus:border-amber-600 focus:ring-amber-600 bg-white dark:bg-white text-slate-900 dark:text-slate-900 dark:border-slate-300"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-700 font-medium"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12  border-slate-300 focus:border-amber-600 focus:ring-amber-600 bg-white dark:bg-white text-slate-900 dark:text-slate-900 dark:border-slate-300"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

             
            </div>

            {/* Remember Me / Accept Terms */}
            <div className="flex items-center justify-between">

                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={handleRememberMeChange}
                      className="bg-white dark:bg-white 
                    border-slate-300 dark:border-slate-300 
                    data-[state=checked]:bg-amber-600 dark:data-[state=checked]:bg-amber-600 
                    data-[state=checked]:border-amber-600 dark:data-[state=checked]:border-amber-600"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-slate-600"
                    >
                      Recordar por 30 días
                    </Label>
                  </div>
                  <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    ¿Olvidaste tu contraseña?
                  </button>
                </>
              
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-slate-800 hover:cursor-pointer hover:bg-slate-900 text-white font-medium"
            >
              {"Iniciar sesión"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Panel*/}
      <div className="hidden md:flex md:flex-1 md:relative md:bg-linear-to-br md:from-slate-800 md:via-slate-700 md:to-slate-900">
        <div className="absolute inset-0 bg-black/20" />

        {/* Background Image Placeholder */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/placeholder.svg?height=800&width=600')`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
                Protegemos tus derechos con excelencia legal
            </h2>
            <p className="text-xl text-slate-200 leading-relaxed max-w-md">
               Accede a tu portal personalizado y mantente informado sobre el progreso de tu caso. Experiencia, confianza y resultados garantizados.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 right-8 w-24 h-24 border border-amber-400/30 rounded-full" />
        <div className="absolute bottom-32 right-16 w-16 h-16 border border-amber-400/20 rounded-full" />
      </div>
    </div>
  );
}
