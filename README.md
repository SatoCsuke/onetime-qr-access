# One-time QR Access System

このリポジトリは、1回限りのQRコードアクセスを提供するシステムです。Google Cloud (Firebase, Firestore) のインフラストラクチャ構築コードと、Next.jsを用いたフロントエンドアプリケーションが含まれています。

## フォルダ構成

- `infra/`: Terraformを使用したGCP/Firebaseのインフラ構築コード（Firestoreデータベース、QRコード用初期データ生成、Firebase Authenticationの設定等）
- `ontime-access/`: Next.jsとFirebaseを利用したWebフロントエンドアプリケーション

## 前提条件

- [Terraform](https://www.terraform.io/) のインストール
- [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install) のインストールおよび認証 (`gcloud auth application-default login`)
- [Node.js](https://nodejs.org/) (v18以降を推奨) と npm のインストール
- [Firebase CLI](https://firebase.google.com/docs/cli) のインストールおよび認証 (`firebase login`)

---

## 環境構築と使い方

### 0. Google Cloudのプロジェクト作成と請求アカウントの紐づけ

Google Cloudのプロジェクト作成と請求アカウントの紐づけは以下を参考にしてください。

- [Google Cloudのプロジェクト作成](https://cloud.google.com/resource-manager/docs/creating-managing-projects?hl=ja)
- [Google Cloudの請求アカウントの紐づけ](https://docs.cloud.google.com/billing/docs/how-to/manage-billing-account?hl=ja)

### 1. インフラの構築 (Terraform)

Terraformを使用して必要なリソースを構築します。

1. `infra/` ディレクトリに移動します。
   ```bash
   cd infra
   ```
2. `terraform.tfvars` ファイルを作成（または編集）し、ご自身のGCPプロジェクト情報に書き換えます。
   ```hcl
   project_name   = "your-project-name"
   project_number = "your-project-number"
   project_id     = "your-project-id"
   ```
   *(※ これにより `variables.tf` 経由で設定値が渡されます)*

3. **【重要】FirebaseプロジェクトとStorageの有効化**
   Terraformを実行する前に、以下の2点を[Firebase コンソール](https://console.firebase.google.com/) から必ず行ってください。これを忘れるとTerraformやデプロイの実行時にエラーになります。
   - 「プロジェクトを追加」から**作成済みのGoogle Cloudプロジェクトを選択してFirebaseを有効化**する。
   - 左側メニューの「Storage」を開き、**「Get Started（始める）」をクリックしてStorageバケットを初期化**する。

4. **クォータプロジェクトの設定**
   ローカルでTerraformを実行する場合、APIの課金先プロジェクトを指定する必要があります。ターミナルで以下を実行してください。
   ```bash
   gcloud auth application-default set-quota-project <your-project-id>
   ```

5. Terraformを初期化し、リソースを構築します。
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```
   ※ この処理により Firestore データベースに `qrid` コレクションが作成され、初期データが登録されます。

### 2. コンテンツ（PDF）のアップロードとCORS設定

アプリケーション内からは Firebase Storage の特定パスを直接参照しており、またブラウザからの直接ダウンロード（Blob）を許可するためのCORS設定が必要です。アプリを動かす前に以下の手順を完了させてください。

1. **コンテンツのアップロード**
   [Firebase コンソールのStorage画面](https://console.firebase.google.com/project/_/storage) を開き、以下の階層になるようにPDFを配置します。
   - `pdfs` フォルダを作成
   - その中に `authenticated_users` フォルダを作成
   - フォルダ内に、任意のPDFファイルを **`book.pdf`** という名前でアップロードします（パス： `/pdfs/authenticated_users/book.pdf`）。

2. **CORS（Cross-Origin Resource Sharing）設定の適用**
   ルートディレクトリにある `cors.json` を使用して、StorageバケットにCORS設定を適用します。これによりアプリケーションからのダウンロードアクセス権が付与されます。
   ターミナルツールで以下を実行してください（`<your-storage-bucket-name>` はご自身のFirebaseプロジェクトで割り当てられたデフォルトのStorageバケット名（例: `your-project-id.appspot.com` や `your-project-id.firebasestorage.app` など）に置き換えてください）。

   ```bash
   # Google Cloud CLI (gcloud/gsutil) を使用する場合
   gsutil cors set cors.json gs://<your-storage-bucket-name>
   ```

### 3. Webアプリケーションのセットアップ (Next.js)

1. `ontime-access/` ディレクトリに移動します。
   ```bash
   cd ../ontime-access
   ```
2. 依存パッケージをインストールします。
   ```bash
   npm install
   ```
3. `ontime-access/` ディレクトリ直下に `.env` ファイルを作成し、プロジェクトのFirebase設定情報を以下の形式で記述します。
   （Firebaseコンソールの「プロジェクトの設定」>「全般」>「マイアプリ」から確認できます）
   ```env
   NEXT_PUBLIC_API_KEY=your_api_key
   NEXT_PUBLIC_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_PROJECT_ID=your_project_id
   NEXT_PUBLIC_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_APP_ID=your_app_id
   NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id
   ```
4. ローカル環境で開発サーバーを起動します。
   ```bash
   npm run dev
   ```
5. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。ログイン等の動作確認が可能です。

### 3. デプロイ

アプリケーションは Firebase Hosting（Web Frameworks機能を利用）にデプロイするよう事前構成されています。
Next.js アプリケーションをデプロイするためには、Firebase CLI の **Web Frameworks の実験的サポート** を有効にする必要があります。

```bash
# プロジェクトを選択
firebase use <your-project-id>

# Web Frameworks サポートを有効化
firebase experiments:enable webframeworks

# デプロイを実行
firebase deploy
```

---

## 備考
- `infra` では自動的に `firestore.googleapis.com` や `identitytoolkit.googleapis.com` などの必要なGCP APIが有効化されます。
- Next.js アプリ側は、認証完了後に `/contents` ページへリダイレクトされる仕様となっています。
