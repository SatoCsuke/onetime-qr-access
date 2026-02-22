# ontime-access (Web Application)

このディレクトリは、1回限りのQRコードアクセスを提供するフロントエンドWebアプリケーション（Next.js）です。
ユーザーは特定のQRコード（ID）からのみサインアップでき、認証されたユーザーのみが限定コンテンツにアクセスできる仕組みを提供しています。

## アプリケーションの主な使い方と画面構成

本アプリケーションは主に以下の3つの画面で構成されています。

### 1. サインアップ画面 (`/signup`)
- **アクセス方法**: 発行されたQRコードを読み取るか、URLに `qrcodeid` パラメータを含めてアクセスします。
  - 例: `http://localhost:3000/signup?qrcodeid=xxxx-yyyy-zzzz`
- **使用方法**: 
  - メールのメールアドレスと任意のパスワードを入力して「Sign Up」をクリックします。
  - 裏側で Cloud Functions (`signup`) を呼び出し、QRコードIDの正当性や未使用かどうかが検証されます。
  - 未使用の正しいQRコードからアクセスしていない場合（URLパラメータがない場合など）は、「QRコードを読み取ってからアクセスしてください」等と表示され、登録できません。

### 2. ログイン画面 (`/login`)
- **使用方法**: すでにQRコードから登録を完了したユーザーは、次回以降こちらからログインします。
- 登録したメールアドレスとパスワードを入力して「Sign In」をクリックします。
- 認証に成功すると、自動的にコンテンツ画面（`/contents`）へリダイレクトされます。

### 3. コンテンツ（ダウンロード）画面 (`/contents`)
- **使用方法**: 認証済みのユーザーだけがアクセスできるページです。未ログイン状態でアクセスするとログイン画面に弾かれます。
- ログイン中のユーザー名（メールアドレス）と、**限定PDFコンテンツ（book.pdf）のダウンロードボタン**が表示されます。
- 「Download PDF」ボタンをクリックしてファイルを取得できます。

---

## ローカル開発環境の起動方法

※ 事前にルートディレクトリの `README.md` を参照し、Firebaseインフラストラクチャ（Terraform）側が構築済みであることを確認してください。

### 1. パッケージのインストール

```bash
cd ontime-access
npm install
```

### 2. 環境変数の設定

`ontime-access/` ディレクトリ直下に `.env.local` という名前のファイルを作成し、Firebaseコンソールから取得したプロジェクトの情報を入力します。

```env
NEXT_PUBLIC_API_KEY=your_api_key
NEXT_PUBLIC_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_APP_ID=your_app_id
NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id
```

*(備考: Cloud Storageへのアクセスが適切に機能するためには、Firebase Storageに `/pdfs/authenticated_users/book.pdf` というファイルが配置されている必要があります)*

### 3. 開発サーバーの起動

```bash
npm run dev
```

起動後、ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスすると、ログイン状態を判定して適切な画面にリダイレクトされます。テスト登録を行う場合は、Firestore (`qrid` コレクション) から取得したIDを使用して `http://localhost:3000/signup?qrcodeid=取得したID` にアクセスしてください。

## デプロイ

このNext.jsアプリはFirebase Hosting (Web Frameworks)を使ってデプロイします。
詳細はルートディレクトリのデプロイ手順をご参照ください。

```bash
firebase deploy
```
