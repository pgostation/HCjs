<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<%
String lang = "en";
String langStr = request.getHeader("accept-language");
if (langStr != null && langStr.startsWith("ja")) {
  lang = "ja";
}
%>
<!DOCTYPE html>
<html lang="<%= lang %>">
<head>
	<title>HCjs help</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.js"></script>
	<link rel="stylesheet" href="css/dashboard.css" />
</head>
<body>
<% if(lang.equals("en")){ %>
	<div data-role="page" data-add-back-btn="true">
		<div data-role="header" data-position="fixed">
			<h1>help</h1>
			<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">ホーム</a>
		</div>
		<div data-role="content">
			<div id="main00">
				<p style="text-align:center"><img src="img/logo.png"/></p>
				<h1>About HCjs</h1>
				<p>It's a Web application.</p>
				<ul>
					<li>It can make buttons and text and pictures on cards.</li>
					<li>And little processing can be performed in a script language like English.</li>
				</ul>
				<h3>What can be made from HCjs</h3>
				<ul>
					<li>The interactive picture-book to which sound was attached. </li>
					<li>The housekeeping book which adds a new card every month. </li>
					<li>The simulation game of mouse operation. </li>
					<li>The action game which uses a virtual pad (or keystroke). </li>
				</ul>
				<h3>The example of what cannot make from HCjs. </h3>
				<ul>
					<li>The advanced game which uses 3D cannot be made. </li>
					<li>An application or a game to be processed high-speed cannot be made. </li>
					<li>The application which processes a picture and binary data cannot be made. </li>
					<li>The application which uses the data on local PC. </li>
				</ul>
				<h3>Correspondence environment</h3>
				<p>The HCjs operates by Safari on iPhone, iPad, and MacOSX. 
				However, in iPhone, since screen size is narrow, a function cannot be used in part. 
				Except Safari, a problem appears in execution of a script, etc. 
				</p>
				<h1>Basic term</h1>
				<h3>Stack</h3>
				<p>A stack is a set of a card. 
				A new stack can be made from HCjs or the stack which other persons made can be used. 
				</p>
				<h3>Card</h3>
				<p>In HCjs, one card of a fixed size is displayed on a screen. 
				A card is movable with an arrow button or a script. 
				A picture can be drawn on a card or a button and the field can be arranged. 
				</p>
				<h3>Background</h3>
				<p>A background is a card which can be used in common for two or more cards. 
				The card has dual structure, and the background which is back is transparent and it appears. 
				</p>
				<h3>Button</h3>
				<p>It's the part which receive click/touch input from a user. 
				If an icon is set up, it can be used also for a display and animation of a picture. 
				</p>
				<h3>Field</h3>
				<p>It's the part for text input or a text display.
				The contents of edit are saved automatically. 
				</p>
				<h3>Script</h3>
				<p>A script can be written to a stack, a card, a button, etc. and various operations, such as calculation and animation, can be carried out. 
				Please refer to a script reference about a script. <a href="scriptreference/">Script Reference(Japanese)</a>
				</p>
				<h3>Tools</h3>
				<p>A tool is chosen from a tool menu and a stack is made. </p>
				<ul>
					<li>A stack can be used with a browsing tool. It is a basic tool.</li>
					<li>Parts are arranged in a card/the background with a button tool and a field tool. Parts are dragged and dropped from an upside palette, and are arranged. Click parts and it can change each property of parts. </li>
					<li>A picture is drawn on a card/background with the other tool (paint tool). </li>
				</ul>
				<h3>Message box</h3>
				<p>A script is inputted and some scripts can be performed very much by the return key. 
				(go, show, hide, and answer commands, message). 
				</p>
				<h3>Script editor</h3>
				<ul>
					<li>A button, the field: Open a script editor by click a button, pushing "script [ -- ]" button from an information dialog, or pressing the option key and the command key. </li>
					<li>A card, a background, a stack: Open an information dialog from a menu, and push "script [ -- ]" button, or open a script editor using the option key, a command key, and the shortcut key of 1, 2, and 3. </li>
				</ul>
				<p>There is neither a debugger nor a variable display nor an event display. 
				</p>
				<h3>Resource editor</h3>
				<p>An addition/edit of a picture, an audio check, an addition/release of expanded function, etc. can be performed. 
				A big graphics file cannot be edited. 
				Upload correspondence is not carried out other than the graphics file. 
				</p>
				<h3>HyperCard</h3>
				<p>HyperCard is the application which operated by old Macintosh. 
				It can be read and used in HCjs, being able to edit the stack of HyperCard. (Part uncorresponded). 
				</p>
				<p>* Macintosh and HyperCard are the registered trademarks of Apple Inc. 
				</p>
			</div>
		</div>
	</div>
<% } else { %>
	<div data-role="page" data-add-back-btn="true">
		<div data-role="header" data-position="fixed">
			<h1>help</h1>
			<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">ホーム</a>
		</div>
		<div data-role="content">
			<div id="main00">
				<p style="text-align:center"><img src="img/logo.png"/></p>
				<h1>HCjsとは</h1>
				<p>HCjsは</p>
				<ul>
					<li>カードにボタンや文字を配置したり絵を書くことができ</li>
					<li>英語のようなスクリプト言語でちょっとした処理ができる</li>
				</ul>
				<p>Webアプリです。
				</p>
				<h3>HCjsで作ることができるもの</h3>
				<ul>
					<li>絵と音の付いたインタラクティブな絵本</li>
					<li>月ごとに新しいカードを足していく家計簿</li>
					<li>マウス操作のシミュレーションゲーム</li>
					<li>バーチャルパッド(キー入力)を使用したアクションゲーム</li>
					<li>インターネット上の情報を取得するアプリ</li>
				</ul>
				<h3>HCjsで作ることができないものの例</h3>
				<ul>
					<li>3Dを使用した高度なゲームは作れません</li>
					<li>高速な処理が必要なアプリやゲーム</li>
					<li>画像やバイナリのデータを処理するアプリ</li>
					<li>ローカルのPCに置いてあるデータを使用するアプリ</li>
				</ul>
				<h3>対応環境</h3>
				<p>HCjsはiPhone, iPad, MacOSX上のSafariで動作します。ただしiPhoneでは画面サイズが狭いため一部機能が使えません。Safari以外ではスクリプトの実行などに問題が出たりします。
				</p>
				<h1>基本用語</h1>
				<h3>スタックとは</h3>
				<p>スタックはカードの集合です。HCjsで新しいスタックを作ったり、他の人が作ったスタックを使用することができます。
				</p>
				<h3>カードとは</h3>
				<p>HCjsでは画面に固定の大きさのカードが一つ表示されます。カードは矢印ボタンやスクリプトで移動できます。カードには絵を描いたり、ボタンやフィールドを配置できます。
				</p>
				<h3>バックグラウンドとは</h3>
				<p>バックグラウンドは複数のカードで共通して使えるカードです。カードは二重構造になっていて、後ろにあるバックグラウンドが透けて見えます。
				</p>
				<h3>ボタンとは</h3>
				<p>ユーザからのクリック/タッチ入力を受け付ける部品です。アイコンを設定すれば画像の表示やアニメーションにも使用できます。
				</p>
				<h3>フィールドとは</h3>
				<p>テキスト入力やテキスト表示のための部品です。編集内容は自動的に保存されます。
				</p>
				<h3>スクリプトについて</h3>
				<p>スタック、カード、ボタンなどにスクリプトを書いて計算やアニメーションなど様々な動作をさせることができます。スクリプトに関しては<a href="scriptreference/">スクリプトリファレンス</a>を参照してください。
				</p>
				<h3>ツールについて</h3>
				<p>ツールメニューからツールを選んでスタックを作っていきます。</p>
				<ul>
					<li>ブラウズツールでスタックを使用できます。基本のツールです。</li>
					<li>ボタンツール、フィールドツールでカード/バックグラウンドに部品を配置します。部品は上部のパレットからドラッグアンドドロップして配置します。部品をクリックして部品の各プロパティを変更できます。</li>
					<li>それ以外のツール（ペイントツール）でカード/バックグラウンドに絵を描きます。</li>
				</ul>
				<h3>メッセージボックスについて</h3>
				<p>スクリプトを入力してreturnキーで、ごく一部のスクリプトが実行できます。（go,show,hide,answerコマンド、メッセージ）
				</p>
				<h3>スクリプトエディタについて</h3>
				<ul>
					<li>ボタン、フィールド：情報ダイアログから「スクリプト…」ボタンを押すか、optionキーとコマンドキーを押しながらボタンをクリックすることでスクリプトエディタを開けます。</li>
					<li>カード、バックグラウンド、スタック：メニューから情報ダイアログを開き「スクリプト…」ボタンを押すか、optionキーとコマンドキーと1,2,3のショートカットキーを使用してスクリプトエディタを開けます。</li>
				</ul>
				<p>デバッガや変数表示やイベント表示はありません。
				</p>
				<h3>リソースエディタについて</h3>
				<p>画像の追加/編集、音声の確認、拡張機能の追加/解除などを行うことができます。大きな画像ファイルは編集できません。画像ファイル以外はアップロード対応していません。
				</p>
				<h3>HyperCardについて</h3>
				<p>HyperCardは昔のMacintoshで動作したアプリケーションです。HCjsではHyperCardのスタックを読み込んで編集、使用できます。(一部未対応)
				</p>
				<p>※Macintosh,HyperCardはApple Inc.の登録商標です
				</p>
			</div>
		</div>
	</div>
<% } %>
</body>
</html>
