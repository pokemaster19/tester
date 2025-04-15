import React, { useState } from "react";

const Profile: React.FC = () => {
  const [name, setName] = useState("Иван Иванов");
  const [email, setEmail] = useState("ivan@example.com");
  const [avatarUrl, setAvatarUrl] = useState("https://via.placeholder.com/150");
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
      {/* Основной контейнер с профилем */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Верхняя часть с аватаром */}
        <div className="bg-indigo-50 p-8 flex flex-col md:flex-row items-center">
          <div className="relative group mb-6 md:mb-0 md:mr-8">
            <img
              src={avatarUrl}
              alt="Аватар"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer text-white text-sm font-medium">
                  Изменить
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                name
              )}
            </h2>
            <p className="text-gray-600">
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                email
              )}
            </p>
          </div>
        </div>

        {/* Нижняя часть с информацией */}
        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
            Информация о профиле
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Должность
              </label>
              <p className="text-gray-800">
                {isEditing ? (
                  <input
                    type="text"
                    defaultValue="Frontend разработчик"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  "Frontend разработчик"
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Телефон
              </label>
              <p className="text-gray-800">
                {isEditing ? (
                  <input
                    type="tel"
                    defaultValue="+7 (999) 123-45-67"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  "+7 (999) 123-45-67"
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Дата рождения
              </label>
              <p className="text-gray-800">
                {isEditing ? (
                  <input
                    type="date"
                    defaultValue="1990-01-01"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  "01.01.1990"
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Город
              </label>
              <p className="text-gray-800">
                {isEditing ? (
                  <input
                    type="text"
                    defaultValue="Москва"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  "Москва"
                )}
              </p>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="mt-8 flex justify-end space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveClick}
                  className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Сохранить изменения
                </button>
              </>
            ) : (
              <button
                onClick={handleEditClick}
                className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Редактировать профиль
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;