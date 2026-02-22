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

3. **【重要】Firebaseプロジェクトの有効化**
   Terraformを実行する前に、[Firebase コンソール](https://console.firebase.google.com/) にアクセスし、「プロジェクトを追加」から**作成済みのGoogle Cloudプロジェクトを選択してFirebaseを有効化**してください。これを忘れるとTerraformの実行時にエラーになります。

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

### 2. Webアプリケーションのセットアップ (Next.js)

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

```bash
# プロジェクトを選択
firebase use <your-project-id>

# デプロイを実行
firebase deploy
```

---

## 備考
- `infra` では自動的に `firestore.googleapis.com` や `identitytoolkit.googleapis.com` などの必要なGCP APIが有効化されます。
- Next.js アプリ側は、認証完了後に `/contents` ページへリダイレクトされる仕様となっています。
