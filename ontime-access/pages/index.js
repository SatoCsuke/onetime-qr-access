import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from "../firebase/firebase"

export default function Home() {
  // Firebaseのアプリ情報をコンソールに出力
    const router = useRouter();

    useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // ログインしている場合
        router.push('/contents'); // ログイン後コンテンツページへリダイレクト
      } else {
        // ログインしていない場合
        router.push('/login'); // ログインしていなければログインページへ
      }
    });
    // Effectのクリーンアップ
    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  );
}
