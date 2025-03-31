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
      const response = await fetch(`http://localhost:5555?steamId=${steamId}`);
      if (!response.ok) {
        throw new Error('Ошибка сервера');
      }
      const responseData = await response.json();
      setData(responseData.general); // Сохраняем данные для диаграмм
    } catch (err) {
      setError(`Ошибка запроса: ${err.message}`);
    } finally {
      setIsLoading(false);
    }

    setSelectedCategory(null);
  };

  // Функция для обработки выбора категории
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
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
      {data && (
        <div className="charts-container">
          {data.map((category) => (
            <div
              key={category.name}
              className={`chart ${selectedCategory?.name === category.name ? 'active' : ''}`}
            >
              <h3>{category.name.toUpperCase()}</h3>
              <CustomPieChart
                category={category}
                onClick={() => setSelectedCategory(category)}
              />
            </div>
          ))}
        </div>
      )}

      {selectedCategory && (
        <div className="items-section">
          <div className="items-grid">
            {/* Сначала выводим собранные предметы */}
            {selectedCategory.user_items?.map(item => (
              <div key={`collected-${item.market_hash_name}`} className="item-card">
                {item.icon_binary ? (
                  <img
                    src={`data:image/png;base64,${item.icon_binary}`}
                    alt={item.name}
                  />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
                <span>{item.name}</span>
                {item.sell_price_text && <span className="price">{item.sell_price_text}</span>}
              </div>
            ))}

            {/* Затем missing предметы */}
            {selectedCategory.other_items?.map(item => (
              <div key={`missing-${item.hash_name}`} className="item-card missing">
                {item.asset_description?.icon_url ? (
                  <img
                    src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.asset_description.icon_url}`}
                    alt={item.name}
                  />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
                <span>{item.name}</span>
                {item.sell_price_text && (
                  <span className="price missing-price">{item.sell_price_text}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;