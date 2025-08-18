import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { User } from '../../types';
import { mockPasswords } from '../../data/mockData';

interface LoginPageProps {
  onLogin: (user: User) => void;
  users: User[];
}

interface CaptchaData {
  question: string;
  answer: number;
  userAnswer: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaData>({
    question: '',
    answer: 0,
    userAnswer: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Générer un captcha mathématique simple
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer: number;
    let question: string;
    
    switch (operator) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '×':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }
    
    setCaptcha({
      question,
      answer,
      userAnswer: ''
    });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    }

    if (!captcha.userAnswer.trim()) {
      newErrors.captcha = 'Veuillez résoudre le captcha';
    } else if (parseInt(captcha.userAnswer) !== captcha.answer) {
      newErrors.captcha = 'Réponse incorrecte';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginAttempts(prev => prev + 1);

    // Simuler un délai de connexion
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Rechercher l'utilisateur
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      // Vérifier le mot de passe (simulation)
      const correctPassword = mockPasswords[user.email.toLowerCase()];
      if (correctPassword && password === correctPassword) {
        onLogin(user);
      } else {
        setErrors({ auth: 'Email ou mot de passe incorrect' });
        generateCaptcha(); // Nouveau captcha après échec
      }
    } else {
      setErrors({ auth: 'Email ou mot de passe incorrect' });
      generateCaptcha(); // Nouveau captcha après échec
    }

    setIsLoading(false);
  };

  const handleCaptchaChange = (value: string) => {
    setCaptcha(prev => ({ ...prev, userAnswer: value }));
    if (errors.captcha) {
      setErrors(prev => ({ ...prev, captcha: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Formulaire centré */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img src="/orange_logo.svg" alt="Orange Telecom" className="h-12 w-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connexion B2B
            </h1>
            <p className="text-gray-600">
              Accédez à votre espace de gestion des services
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  if (errors.auth) setErrors(prev => ({ ...prev, auth: '' }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.email || errors.auth ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="exemple@orange.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    if (errors.auth) setErrors(prev => ({ ...prev, auth: '' }));
                  }}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.password || errors.auth ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Captcha */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Vérification de sécurité
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-white px-4 py-3 rounded-lg border border-gray-300">
                  <span className="text-lg font-mono">
                    {captcha.question} = ?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <input
                type="number"
                value={captcha.userAnswer}
                onChange={(e) => handleCaptchaChange(e.target.value)}
                className={`mt-3 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.captcha ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Votre réponse"
                disabled={isLoading}
              />
              {errors.captcha && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.captcha}
                </p>
              )}
            </div>

            {/* Erreur d'authentification */}
            {errors.auth && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {errors.auth}
                </p>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Besoin d'aide ? Contactez le support technique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
