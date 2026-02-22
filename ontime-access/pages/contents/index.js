// pages/contents.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../firebase/firebase';
import { storage, ref, getDownloadURL, StorageError } from "../../firebase/firebase";
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Contents() {
  const [user, setUser] = useState(null);
  const [downloadURL, setDownloadURL ] = useState(null);
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

      getDownloadURL(starsRef)
        .then((url) => {
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
        {downloadURL && (
          <a href={downloadURL} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Download PDF
          </a>
          
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
