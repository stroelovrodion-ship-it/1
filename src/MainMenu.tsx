import { useState, useEffect } from 'react';
import { hasSaveGame, getSaveInfo } from './engine/gameEngine';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
}

export function MainMenu({ onNewGame, onLoadGame }: MainMenuProps) {
  const [hasSave, setHasSave] = useState(false);
  const [saveInfo, setSaveInfo] = useState<{ timestamp: number; level: number; location: string } | null>(null);

  useEffect(() => {
    setHasSave(hasSaveGame());
    setSaveInfo(getSaveInfo());
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Press Start 2P', monospace",
      color: '#e0e0e0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Фоновые частицы */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 30%, rgba(102, 204, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(204, 102, 255, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Заголовок */}
      <div style={{
        fontSize: '32px',
        color: '#6cf',
        textShadow: '0 0 20px rgba(102, 204, 255, 0.8), 0 0 40px rgba(102, 204, 255, 0.4)',
        marginBottom: '16px',
        textAlign: 'center',
        letterSpacing: '2px',
      }}>
        МАГИ
      </div>
      <div style={{
        fontSize: '24px',
        color: '#c6f',
        textShadow: '0 0 15px rgba(204, 102, 255, 0.8), 0 0 30px rgba(204, 102, 255, 0.4)',
        marginBottom: '48px',
        textAlign: 'center',
        letterSpacing: '1px',
      }}>
        НОВОГО МИРА
      </div>

      {/* Подзаголовок */}
      <div style={{
        fontSize: '10px',
        color: '#888',
        marginBottom: '64px',
        textAlign: 'center',
        fontStyle: 'italic',
      }}>
        Текстовая RPG с конструктором магии
      </div>

      {/* Кнопки меню */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
      }}>
        <button
          onClick={onNewGame}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            padding: '16px 24px',
            background: 'transparent',
            border: '2px solid #6cf',
            color: '#6cf',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textShadow: '0 0 8px rgba(102, 204, 255, 0.6)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#6cf';
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(102, 204, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6cf';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          🎮 НОВАЯ ИГРА
        </button>

        {hasSave && saveInfo && (
          <button
            onClick={onLoadGame}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '12px',
              padding: '16px 24px',
              background: 'transparent',
              border: '2px solid #6f6',
              color: '#6f6',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textShadow: '0 0 8px rgba(102, 255, 102, 0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#6f6';
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(102, 255, 102, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6f6';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            💾 ЗАГРУЗИТЬ ИГРУ
          </button>
        )}

        {hasSave && saveInfo && (
          <div style={{
            fontSize: '8px',
            color: '#888',
            textAlign: 'center',
            padding: '12px',
            border: '1px solid #333',
            background: 'rgba(10, 10, 26, 0.5)',
          }}>
            <div style={{ marginBottom: '8px', color: '#6cf' }}>ПОСЛЕДНЕЕ СОХРАНЕНИЕ:</div>
            <div>📅 {formatDate(saveInfo.timestamp)}</div>
            <div>⭐ Уровень: {saveInfo.level}</div>
            <div>📍 {saveInfo.location}</div>
          </div>
        )}
      </div>

      {/* Версия */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        fontSize: '8px',
        color: '#555',
      }}>
        v1.0.0 | © 2024
      </div>
    </div>
  );
}
