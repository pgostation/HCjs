<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" errorPage="error_page.jsp" %>
<jsp:useBean id="HTMLesc" scope="page" class="javabeans.HTMLescape"/>
<%
    String lang = "en";
    String langStr = request.getHeader("accept-language");
    if (langStr != null && langStr.startsWith("ja")) {
	  lang = "ja";
    }
%>
<!DOCTYPE html>
<html lang="ja">
<head>
	<title>HCjs <%= HTMLesc.escapeTrans("Terms", lang) %></title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.css" />
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min.js"></script>
	<link rel="stylesheet" href="css/dashboard.css" />
</head>
<body>
	<div data-role="page" data-add-back-btn="true">
		<div data-role="header" data-position="fixed">
			<h1><%= HTMLesc.escapeTrans("Terms", lang) %></h1>
			<a href="./" data-icon="home" data-iconpos="notext" class="ui-btn-right">Home</a>
		</div>
		<div id="main00" data-role="content">
<% if(!lang.equals("ja")){ %>
It is considered by using this service that a user is that on which it has agreed about all the written contents of this use agreement. <br><br>
A user takes all responsibility about the act of all that should use this service in a user's own responsibility, and was made using this service, and its result.<br><br> 
When it is judged that this service administrator is required, this service user's data may be deleted. <br><br>
Even when not judging that this service administrator is required, this service user's data may be changed and deleted.<br><br> 
It may be changed and stopped by the contents of this service without a preliminary announcement. <br><br>
This service user agrees whether like to produce by the ability to have not used, and that this service administrator does not take [ that this service was used or ] obligation to pay reparations in the becoming disadvantage.<br><br> 
<br><br>
This service user is infringement of intellectual property rights, such as - copyright which must not perform the following acts.<br> 
- Infringement of privacy or portrait rights <br>
- The picture of the act and obscenity which damages slander slander and an insult, discrimination, or honor and trust, and child pornography, and public presentation of data <br>
- Transmission of the illegal network access and the unsolicited junk e-mail to a third party services, equipment, etc., such as an act and this service, equipment, etc. which alter or eliminate the information of the others using this service<br> 
- The act which gives trouble to use or management of a third party's services, equipment, etc., such as - book service, equipment, etc. which perform the writing aiming at an advertisement, advertisement, invitation, etc. without notice<br> 
- The invitation to an illegal act, agency, or invitation <br>
- The act which breaks or has the fear in good public order and customs <br>
- The act which breaks or has the fear in a statute <br>
- The act which this service administrator judges to be disqualified as a user of this service in addition to this <br><br><br>
<% } %>
利用者は、本サービスを利用することにより、本利用規約のすべての記載内容について同意したものとみなされます。<br>
<!-- ◕ 僕と契約してこのサービスを使ってよ! ◕ --><br>
利用者は、利用者自身の責任において本サービスを利用するものとし、本サービスを利用してなされた一切の行為及びその結果について一切の責任を負います。<br>
<!--  --><br>
本サービス管理者が必要と判断した場合には、本サービス利用者のデータは削除される場合があります。<br>
<!--  --><br>
意図しない事象により、本サービス利用者のデータは変更、削除される場合があります。<!--大事なデータはバックアップ♪--><br>
<!--  --><br>
本サービスの内容は予告無く変更、停止される場合があります。<!--大事なデータはバックアップ♪--><br>
<!--  --><br>
本サービス利用者は、本サービスを利用したこと、あるいは利用できなかったことによって生じたいかなる不利益も本サービス管理者が賠償責任を負わないことに同意します。<br>
<!--  --><br>
本サービス利用者は以下の行為を行ってはいけません<br>
・著作権等の知的財産権の侵害<br>
・プライバシーや肖像権の侵害<br>
・誹謗中傷・侮辱や差別、あるいは名誉や信用を毀損する行為<br>
・わいせつ、児童ポルノの画像やデータの公開<br><!--さくらでは実写はダメだがイラストはOKらしい？-->
・本サービスを利用する他者の情報を改ざんまたは消去する行為<br>
・本サービスや設備等もしくは第三者のサービスや設備等への不正アクセス行為<br>
・迷惑メールの送信<br>
・無断で広告、宣伝、勧誘等を目的とした書き込みを行う<br>
・本サービスや設備等もしくは第三者のサービスや設備等の利用もしくは管理に支障を与える行為<br>
・違法行為への勧誘、仲介または誘引<br>
・公序良俗に違反するまたはそのおそれのある行為<br>
・法令に違反するまたはそのおそれのある行為<br>
・その他本サービス管理者が本サービスの利用者として不適格と判断する行為<br>
</div>
</div>
</body>
</html>
