package javabeans;

public class HTMLescape {
	public String substitute(String input, String pattern, String replacement) {
	    // 置換対象文字列が存在する場所を取得
	    int index = input.indexOf(pattern);

	    // 置換対象文字列が存在しなければ終了
	    if(index == -1) {
	        return input;
	    }

	    // 処理を行うための StringBuffer
	    StringBuffer buffer = new StringBuffer();

	    buffer.append(input.substring(0, index) + replacement);

	    if(index + pattern.length() < input.length()) {
	        // 残りの文字列を再帰的に置換
	        String rest = input.substring(index + pattern.length(), input.length());
	        buffer.append(substitute(rest, pattern, replacement));
	    }
	    return buffer.toString();
	}

	public String escape(String input) {
		if(input==null) return null;
	    input = substitute(input, "&",  "&amp;");
	    input = substitute(input, "<",  "&lt;");
	    input = substitute(input, ">",  "&gt;");
	    input = substitute(input, "\"", "&quot;");
	    return input;
	}

	public String escapeBR(String input) {
		if(input==null) return null;
	    input = substitute(input, "&",  "&amp;");
	    input = substitute(input, "<",  "&lt;");
	    input = substitute(input, ">",  "&gt;");
	    input = substitute(input, "\"", "&quot;");
	    input = substitute(input, "\n", "<br>");
	    return input;
	}
	
	public String escapeTrans(String in, String lang){
		if(in==null) in="";
		String outStr = in;
		if(lang=="ja"){
			if(in.equals("Home")){
				outStr = "ホーム";}

			//stackinfo
			if(in.equals("tool")){
				outStr = "ツール";}
			if(in.equals("game")){
				outStr = "ゲーム";}
			if(in.equals("business")){
				outStr = "ビジネス";}
			if(in.equals("network")){
				outStr = "ネット";}
			if(in.equals("home")){
				outStr = "家庭";}
			if(in.equals("education")){
				outStr = "教育";}
			if(in.equals("development")){
				outStr = "開発";}
			if(in.equals("other")){
				outStr = "その他";}
			
			if(in.equals("public")){
				outStr = "公開";}
			if(in.equals("public_dontsearch")){
				outStr = "公開(検索に出さない)";}
			if(in.equals("private")){
				outStr = "非公開";}
			if(in.equals("copy_public")){
				outStr = "許可";}
			if(in.equals("cantcopy")){
				outStr = "不許可";}
			
			if(in.equals("Copy:")){
				outStr = "コピー:";}
			if(in.equals("Status")){
				outStr = "ステータス";}
			if(in.equals("Author")){
				outStr = "作者";}
			if(in.equals("Original Author")){
				outStr = "コピー元";}
			if(in.equals("Status")){
				outStr = "ステータス";}
			if(in.equals("Stack Info")){
				outStr = "スタック情報";}
			if(in.equals("Edit ")){
				outStr = "";}
			if(in.equals("'s Info ")){
				outStr = "の情報を編集";}
			if(in.equals("Open")){
				outStr = "開く";}
			if(in.equals("Copy")){
				outStr = "コピー";}
			if(in.equals("Detail")){
				outStr = "詳細";}
			if(in.equals("Protect")){
				outStr = "保護";}
			if(in.equals("To public, protect switch turn-ON")){
				outStr = "公開するには保護をONにします";}
			if(in.equals("Protect-ON: You can't change Stack data. Your change is saved in personal area.")){
				outStr = "保護: スタックを変更できません。ユーザの変更した内容は個人エリアに保存されます。";}
			if(in.equals("Counter:")){
				outStr = "アクセス数:";}
			if(in.equals("Size")){
				outStr = "サイズ";}

			if(in.equals("Tweet")){
				outStr = "ツイート";}
			
			//index.jsp
			if(in.equals("Information")){
				outStr = "お知らせ";}
			if(in.equals("Privacy policy")){
				outStr = "プライバシーポリシー";}
			if(in.equals("Terms")){
				outStr = "利用規約";}
			if(in.equals("User ID")){
				outStr = "ユーザID";}
			if(in.equals("Password")){
				outStr = "パスワード";}
			if(in.equals("Login")){
				outStr = "ログイン";}
			if(in.equals("Logged in")){
				outStr = "ログイン中";}
			if(in.equals("Logout")){
				outStr = "ログアウト";}
			if(in.equals("Create new account")){
				outStr = "アカウント作成";}
			if(in.equals("Tutorial")){
				outStr = "チュートリアル";}
			if(in.equals("User Settings")){
				outStr = "ユーザ設定";}
			if(in.equals("New Stack")){
				outStr = "新規スタック";}
			if(in.equals("Stack List")){
				outStr = "スタック一覧";}
			if(in.equals("File Manager")){
				outStr = "ファイル管理";}
			if(in.equals("Import HyperCard stack")){
				outStr = "HyperCardスタック読み込み";}
			if(in.equals("Search Stacks")){
				outStr = "スタック検索";}
			if(in.equals("Help")){
				outStr = "ヘルプ";}
			if(in.equals("HCjs supports Safari web browser.")){
				outStr = "HCjsはSafariで動作します。";}
			
			//newaccount.jsp
			if(in.equals("Mail Address")){
				outStr = "メールアドレス";}
			if(in.equals("minimum 3 characters, alphabet, number or underbar")){
				outStr = "3文字以上15文字以下の半角英数字およびアンダーバー";}
			if(in.equals("minimum 6 characters")){
				outStr = "6文字以上32文字以下";}
			if(in.equals("Accept Terms")){
				outStr = "利用規約に同意する";}
			if(in.equals("Create New Account")){
				outStr = "新規アカウント作成";}
			if(in.equals("Create")){
				outStr = "作成";}
			
			//user.jsp
			if(in.equals("User Info")){
				outStr = "ユーザ情報";}
			if(in.equals("Edit Info")){
				outStr = "情報を編集";}
			if(in.equals("'s Info")){
				outStr = "の情報";}
			if(in.equals("Web Site")){
				outStr = "ウェブサイト";}
			if(in.equals("Profile")){
				outStr = "プロフィール";}
			if(in.equals("'s Public Stacks")){
				outStr = "の公開中のスタック";}
			if(in.equals("  Release:")){
				outStr = "  公開日:";}
			if(in.equals("  Counter:")){
				outStr = "  アクセス数:";}
			//useredit.jsp
			if(in.equals("User Settings")){
				outStr = "ユーザ設定";}
			if(in.equals("Change Password")){
				outStr = "パスワードを変更する";}
			if(in.equals("Submit")){
				outStr = "設定反映";}
			if(in.equals("Delete Your Account")){
				outStr = "アカウントを削除";}
			if(in.equals("Old Password")){
				outStr = "現在のパスワード";}
			if(in.equals("New Password")){
				outStr = "新しいパスワード";}
			if(in.equals("Mail Address (Not Public)")){
				outStr = "メールアドレス(非公開)";}
			if(in.equals("Delete Your Account?")){
				outStr = "本当にアカウントを削除しますか?";}
			
			//newstack.jsp
			if(in.equals("New Stack")){
				outStr = "新規スタック";}
			if(in.equals("Name")){
				outStr = "名前";}
			if(in.equals("Category")){
				outStr = "カテゴリ";}
			if(in.equals("Portlait")){
				outStr = "ポートレート";}
			if(in.equals("Size")){
				outStr = "サイズ";}
			if(in.equals("Create a New Stack")){
				outStr = "スタック作成";}
			if(in.equals("Delete this Stack")){
				outStr = "スタックを削除";}
			if(in.equals("Delete this Stack?")){
				outStr = "本当にスタックを削除しますか?";}
			if(in.equals("Version")){
				outStr = "バージョン";}

			//stacks.jsp
			if(in.equals("My Stacks")){
				outStr = "スタック一覧";}
			
			//finder.jsp
			if(in.equals("Back")){
				outStr = "戻る";}
			if(in.equals(" Files")){
				outStr = " のファイル一覧";}
			if(in.equals("Folder Size")){
				outStr = "フォルダ容量";}
			if(in.equals("This folder is empty")){
				outStr = "フォルダは空です";}
			if(in.equals("data-filter-placeholder='Filter Items...'")){
				outStr = "data-filter-placeholder='絞り込み検索'";}
			if(in.equals("Download")){
				outStr = "ダウンロード";}
			if(in.equals("Download this folder")){
				outStr = "このフォルダをダウンロードする";}
			if(in.equals("Delete File")){
				outStr = "ファイル削除";}
			if(in.equals("Delete this File?")){
				outStr = "本当にファイルを削除しますか?";}
			
			
			//special
			if(in.equals("")){
				outStr = "";}
			if(in.equals("Convert a HyperCard Stack")){
				outStr = "HyperCardスタックからの変換";}
			if(in.equals("Compress a HyperCard Stack on MacOSX. (Select 'Compress 〜' at Context Menu)")){
				outStr = "MacOSXでHyperCardスタックを圧縮します。(コンテクストメニューで「〜を圧縮」を選択)";}
			if(in.equals("Upload .zip File.")){
				outStr = "圧縮ファイル(.zip)をアップロードします";}
			if(in.equals("(If converting is failure, try do menu \"Compact Stack...\" on HyperCard.)")){
				outStr = "(変換に失敗するようなら圧縮ファイル名をアルファベットにしてから変換を試してください。)";}
			if(in.equals("Upload .zip File")){
				outStr = "zipファイルのアップロード";}
			if(in.equals("Disk Full")){
					outStr = "空き容量が不足しています";}
			
			//search.jsp
			if(in.equals("Newer 10 Stacks")){
				outStr = "新着10件";}
			if(in.equals("Public Date")){
				outStr = "公開日";}
			
			//stackplayer2.jsp
			if(in.equals("Find String")){
				outStr = "検索";}
			if(in.equals("Find Next")){
				outStr = "次を検索";}
			if(in.equals("Stack")){
				outStr = "スタック";}
			if(in.equals("Edit")){
				outStr = "編集";}
			if(in.equals("Go")){
				outStr = "ゴー";}
			if(in.equals("Tools")){
				outStr = "ツール";}
			if(in.equals("Fonts")){
				outStr = "文字";}
			if(in.equals("Menu")){
				outStr = "メニュー";}
			if(in.equals("Transparent")){
				outStr = "透明";}
			if(in.equals("Opaque")){
				outStr = "不透明";}
			if(in.equals("Rect")){
				outStr = "長方形";}
			if(in.equals("RoundRect")){
				outStr = "丸みのある長方形";}
			if(in.equals("Shadow")){
				outStr = "シャドウ";}
			if(in.equals("Standard")){
				outStr = "標準";}
			if(in.equals("Scroll")){
				outStr = "スクロール";}
			if(in.equals("Button Information")){
				outStr = "ボタン情報";}
			if(in.equals("Field Information")){
				outStr = "フィールド情報";}
			if(in.equals("Card Information")){
				outStr = "カード情報";}
			if(in.equals("Background Information")){
				outStr = "バックグラウンド情報";}
			if(in.equals("Stack Information")){
				outStr = "スタック情報";}
			if(in.equals("Script…")){
				outStr = "スクリプト…";}
			if(in.equals("Modify Version")){
				outStr = "変更バージョン";}
			if(in.equals("Created By Version")){
				outStr = "作成バージョン";}
			if(in.equals("Property")){
				outStr = "プロパティ";}
			if(in.equals("UserLevel")){
				outStr = "ユーザレベル";}
			if(in.equals("Width")){
				outStr = "幅";}
			if(in.equals("Height")){
				outStr = "高さ";}
			if(in.equals("Can't Abort")){
				outStr = "停止不可";}
			if(in.equals("Can't Modify")){
				outStr = "変更不可";}
			if(in.equals("Can't Peek")){
				outStr = "パーツ強調表示不可";}
			if(in.equals("Show Navigator")){
				outStr = "ナビゲーター表示";}
			if(in.equals("Show Picture")){
				outStr = "ピクチャを表示";}
			if(in.equals("Can't Delete")){
				outStr = "削除不可";}
			if(in.equals("Don't Search")){
				outStr = "検索しない";}
			if(in.equals("Number")){
				outStr = "番号";}
			if(in.equals("Marked")){
				outStr = "マーク";}
			if(in.equals("Font…")){
				outStr = "フォント…";}
			if(in.equals("Lock Text")){
				outStr = "ロックテキスト";}
			if(in.equals("Don't Wrap")){
				outStr = "行を回り込ませない";}
			if(in.equals("Auto Select")){
				outStr = "自動的に選択";}
			if(in.equals("Wide Margins")){
				outStr = "余白を広く";}
			if(in.equals("Multiple Lines")){
				outStr = "複数行";}
			if(in.equals("Fixed Line Height")){
				outStr = "行の高さを固定";}
			if(in.equals("Auto Tab")){
				outStr = "オートタブ";}
			if(in.equals("Show Lines")){
				outStr = "行表示";}
			if(in.equals("Vertically Text")){
				outStr = "縦書き";}
			if(in.equals("Shared Text")){
				outStr = "テキストを共有";}
			if(in.equals("Show Name")){
				outStr = "名前を表示";}
			if(in.equals("Content…")){
				outStr = "内容…";}
			if(in.equals("Icon…")){
				outStr = "アイコン…";}
			if(in.equals("Location")){
				outStr = "位置";}
			if(in.equals("Cut")){
				outStr = "カット";}
			if(in.equals("Delete")){
				outStr = "削除";}
			if(in.equals("Left")){
				outStr = "左";}
			if(in.equals("Top")){
				outStr = "上";}
			if(in.equals("Default")){
				outStr = "省略時設定";}
			if(in.equals("Oval")){
				outStr = "楕円";}
			if(in.equals("Popup")){
				outStr = "ポップアップ";}
			if(in.equals("Checkbox")){
				outStr = "チェックボックス";}
			if(in.equals("Radio")){
				outStr = "ラジオボタン";}
			if(in.equals("Range")){
				outStr = "レンジ";}
			if(in.equals("Family")){
				outStr = "ファミリー";}
			if(in.equals("None")){
				outStr = "なし";}
			if(in.equals("Scale Icon")){
				outStr = "アイコンの拡大";}
			if(in.equals("Auto Hilite")){
				outStr = "オートハイライト";}
			if(in.equals("Enabled")){
				outStr = "使えるように";}
			if(in.equals("Shared Hilite")){
				outStr = "ハイライトを共有";}
			if(in.equals("Send Farther")){
				outStr = "背面に送る";}
			if(in.equals("Bring Closer")){
				outStr = "前面に出す";}
			if(in.equals("LineHeight")){
				outStr = "行の高さ";}
			if(in.equals("Style")){
				outStr = "スタイル";}
			if(in.equals("TextAlign")){
				outStr = "行揃え";}
			if(in.equals("Bold")){
				outStr = "太字";}
			if(in.equals("Italic")){
				outStr = "斜体";}
			if(in.equals("Underline")){
				outStr = "下線";}
			if(in.equals("Outline")){
				outStr = "アウトライン";}
			if(in.equals("Condensed")){
				outStr = "字間狭く";}
			if(in.equals("Extend")){
				outStr = "字間広げる";}
			if(in.equals("Center")){
				outStr = "中";}
			if(in.equals("Right")){
				outStr = "右";}

			if(in.equals("Open Help Page")){
				outStr = "ヘルプページを開く";}
			if(in.equals("Open Script Reference")){
				outStr = "スクリプトリファレンスを開く";}
			
			//error createstack
			if(in.equals("UserID failure.")){
				outStr = "ユーザIDが不正です。";}
			if(in.equals("StackName failure.")){
				outStr = "スタック名に使用禁止文字が含まれています。";}
			if(in.equals("StackName is empty.")){
				outStr = "スタック名を入力してください。";}
			if(in.equals("The stack's name is duplicate.")){
				outStr = "その名前は既に使われています。";}
			if(in.equals("Couldn't cleate a stack file.")){
				outStr = "スタックファイルが作れません。";}

			//error newaccount
			if(in.equals("user id failure")){
				outStr = "ユーザIDが不正です。";}
			if(in.equals("mail address failure")){
				outStr = "メールアドレスが不正です。";}
			if(in.equals("password failure")){
				outStr = "パスワードが不正です。";}
			if(in.equals("user id dupilicate")){
				outStr = "そのユーザIDは使われています。";}
		}
		else{
			if(in.equals("copy_public")){
				outStr = "can copy";}
			if(in.equals("cantcopy")){
				outStr = "cannot copy";}
			
			if(in.equals("public_dontsearch")){
				outStr = "Public (Don't view at Stack Search)";}
			if(in.equals("public")){
				outStr = "Public";}
			if(in.equals("private")){
				outStr = "Private";}

			if(in.equals("tool")){
				outStr = "Tool";}
			if(in.equals("game")){
				outStr = "Game";}
			if(in.equals("business")){
				outStr = "Business";}
			if(in.equals("network")){
				outStr = "Network";}
			if(in.equals("home")){
				outStr = "Home";}
			if(in.equals("education")){
				outStr = "Education";}
			if(in.equals("development")){
				outStr = "Development";}
			if(in.equals("other")){
				outStr = "Other";}

			if(in.equals("data-filter-placeholder='Filter Items...'")){
				outStr = "";}
			
			if(in.equals("Public Date")){
				outStr = "Date";}
		}
		return escape(outStr);
	}
}
