// pages/contents.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../firebase/firebase';
import { storage, ref, getDownloadURL, getBlob, StorageError } from "../../firebase/firebase";
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Contents() {
  const [user, setUser] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);
  const [downloadError, setDownloadError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        getDownloadLink();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe(); // クリーンアップ
  }, [router]);

  const getDownloadLink = async () => {
    setDownloadError(null); // 初期化

    try {
      const starsRef = ref(storage, '/pdfs/authenticated_users/book.pdf');

      getBlob(starsRef)
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          setDownloadURL(url);
        })
        .catch((error) => {
          switch (error.code) {
            case 'storage/object-not-found':
              setDownloadError("ファイルが見つかりませんでした。");
              break;
            case 'storage/unauthorized':
              setDownloadError("ファイルへのアクセス権がありません。");
              break;
            case 'storage/canceled':
              setDownloadError("ダウンロードがキャンセルされました。");
              break;
            case 'storage/unknown':
              setDownloadError("不明なエラーが発生しました。");
              break;
            default:
              setDownloadError("ダウンロード中にエラーが発生しました。");
              console.error("ダウンロードURLの取得エラー", error);
              break;
          }
        });

    } catch (error) {
      console.error("エラーが発生しました", error);
    }

  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="block text-gray-700 text-2xl font-bold mb-2">Contents</h1>
        <p className="block text-gray-700 text-base mb-4">Welcome, {user.email}!</p>
        {downloadURL ? (
          <a href={downloadURL} download="book.pdf" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Download PDF
          </a>
        ) : (
          <button disabled className="bg-green-500 opacity-50 cursor-not-allowed text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Preparing Download...
          </button>
        )}
        {downloadError && <p className="text-red-500">{downloadError}</p>}
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Contents;
