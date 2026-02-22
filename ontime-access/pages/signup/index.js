import { useEffect, useState } from 'react';
import { app } from '../../firebase/firebase';
import {useRouter} from 'next/router';
import { getFunctions, httpsCallable } from 'firebase/functions'

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qrCodeId, setQrCodeId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  useEffect(() => {

        const urlParams = new URLSearchParams(window.location.search);
        const qrCodeId = urlParams.get('qrcodeid');

        if (qrCodeId) {
            setQrCodeId(qrCodeId)
        } else {
            setError('IDが見つかりません。');
        }
        
    }, [router.isReady]);

    const handleSignUp = async(e) => {
        e.preventDefault();
        setError('');

        const functions = getFunctions(app);
        const signup = httpsCallable(functions, 'signup');

        try {
            console.log(qrCodeId);
            const result = await signup({email: email, password: password, qrcodeid: qrCodeId})

            if (result.data.isSuccess) {
              router.push('/contents');
            } else {
              setError('サインアップに失敗しました');
            };
            
        } catch(verifyError) {
            setError(verifyError.message);
        };      
    };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="block text-gray-700 text-2xl font-bold mb-6">Sign Up</h1>
        {error && <p className="text-red-700 text-xs italic">{error}</p>}
        {qrCodeId ? (
          <form onSubmit={handleSignUp}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Sign Up
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-700 text-base text-center">QRコードを読み取ってからアクセスしてください</p>
        )}
      </div>
    </div>
  );
};

