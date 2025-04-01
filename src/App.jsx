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
    // Добавляем принудительный сброс перед установкой новой категории
    setSelectedCategory(null);
    setTimeout(() => {
      setSelectedCategory(
        data.collection.find(c => c.name === category.name) || category
      );
    }, 0);
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
            <CustomPieChart
              key={category.name}
              category={category}
              isActive={selectedCategory?.name === category.name}
              onClick={() => handleCategorySelect(category)}
            />
          ))}
        </div>
      )}

      {selectedCategory && console.log("Selected category data:", selectedCategory)}

      {selectedCategory && (
        <div className="items-section">
          <h2>{selectedCategory.name.toUpperCase()} ITEMS</h2>
          <div className="items-grid">
            {/* Collected items */}
            {selectedCategory.user_items?.map((item, index) => (
              <div
                key={`collected-${selectedCategory.name}-${item.classid || index}`}
                className="item-card"
              >
                {/* Добавляем значок события */}
                {item.tag === "april_event" && (
                  <span className="item-event-tag">April Event</span>
                )}

                {item.binary_image ? (
                  <img
                    src={`data:image/png;base64,${item.binary_image}`}
                    alt={item.name}
                    className="item-image"
                    onError={(e) => {
                      if (item.icon_url) {
                        e.target.src = `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`;
                      } else {
                        e.target.src = '/placeholder-collected.png';
                      }
                    }}
                  />
                ) : item.icon_url ? (
                  <img
                    src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`}
                    alt={item.name}
                    className="item-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-collected.png';
                    }}
                  />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
                <span className="item-name">{item.name}</span>
              </div>
            ))}

            {/* Missing items */}
            {selectedCategory.other_items?.map((item, index) => (
              <div
                key={`missing-${selectedCategory.name}-${item.hash_name || index}`}
                className="item-card missing"
              >
                {item.tag === "april_event" && (
                  <span className="item-event-tag">April Event</span>
                )}

                {item.binary_image ? (
                  <img
                    src={`data:image/png;base64,${item.asset_description.binary_image}`}
                    alt={item.name}
                    className="item-image missing-image"
                  />
                ) : item.asset_description?.icon_url ? (
                  <img
                    src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.asset_description.icon_url}`}
                    alt={item.name}
                    className="item-image missing-image"
                  />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
                <span className="item-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;