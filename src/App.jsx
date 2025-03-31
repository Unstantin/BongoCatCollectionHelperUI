import { useState } from 'react';
import './App.css';
import CustomPieChart from './components/PieChart';

function App() {
  const [steamUrl, setSteamUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const validateSteamUrl = (url) => {
    const steamRegex = /^(https?:\/\/)?(www\.)?steamcommunity\.com\/(profiles\/[0-9]+|id\/[a-zA-Z0-9_-]+)\/?$/;
    return steamRegex.test(url);
  };

  const extractSteamId = (url) => {
    // Если ссылка содержит "/profiles/" — извлекаем цифровой ID
    if (url.includes('/profiles/')) {
      return url.split('/profiles/')[1].replace(/\/$/, ''); // Удаляем слеши в конце
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!steamUrl.trim()) {
      setError('Введите ссылку на Steam-аккаунт');
      return;
    }

    if (!validateSteamUrl(steamUrl)) {
      setError('Некорректная ссылка Steam.');
      return;
    }

    setError('');
    setIsLoading(true);

    const steamId = extractSteamId(steamUrl);
    if (!steamId) {
      setError('Не удалось извлечь Steam ID');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:15542?steamId=${steamId}&_=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store' // Важное современное решение
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const responseData = await response.json();
      console.log("Полные данные с сервера:", responseData);
      
      setData({
        general: responseData.general,
        collection: responseData.collection
      });
    } catch (err) {
      setError(`Ошибка запроса: ${err.message}`);
      console.error("Детали ошибки:", err);
    } finally {
      setIsLoading(false);
    }

    setSelectedCategory(null);
  };

  // Находим полные данные категории при выборе
  const handleCategorySelect = (category) => {
    const fullCategoryData = data.collection.find(c => c.name === category.name);
    setSelectedCategory(fullCategoryData || category);
  };

  return (
    <div className="App">
      <h1>Bongo Cat Collection Helper</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={steamUrl}
          onChange={(e) => {
            setSteamUrl(e.target.value);
            setError('');
          }}
          placeholder="Введите ссылку на Steam-аккаунт"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      {/* Показываем диаграммы, если есть данные */}
      {data?.general && (
        <div className="charts-container">
          {data.general.map((category) => (
            <div key={category.name} className={`chart ${selectedCategory?.name === category.name ? 'active' : ''}`}>
              <h3>{category.name.toUpperCase()}</h3>
              <CustomPieChart 
                category={category} 
                onClick={() => handleCategorySelect(category)}
              />
            </div>
          ))}
        </div>
      )}

      {selectedCategory && console.log("Selected category data:", selectedCategory)}
      {selectedCategory && console.log("User items count", selectedCategory.user_items)}
      {selectedCategory && console.log("Other items count", selectedCategory.other_items)}
      
      {selectedCategory && (
        <div className="items-section">
          <h2>{selectedCategory.name.toUpperCase()} ITEMS</h2>
          <div className="items-stats">
            <span>Collected: {selectedCategory.user_items?.length || 0}</span>
            <span>Missing: {selectedCategory.other_items?.length || 0}</span>
          </div>
          <div className="items-grid">
            {/* Collected items */}
            {selectedCategory.user_items?.map(item => (
              <div key={`collected-${item.classid}`} className="item-card">
                {/* ... рендер collected item ... */}
              </div>
            ))}
            
            {/* Missing items */}
            {selectedCategory.other_items?.map(item => (
              <div key={`missing-${item.hash_name}`} className="item-card missing">
                {/* ... рендер missing item ... */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;