import React from "react";

const Register: React.FC = () => {
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика регистрации
    console.log("Пользователь зарегистрирован");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
        <input
          type="text"
          placeholder="Имя пользователя"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full p-2 mb-6 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
        >
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

export default Register;
