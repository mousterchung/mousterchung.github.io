<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" indent="yes"/>
	<xsl:template match="/">
		<html>
			<head>
				<title><xsl:value-of select="mrt[@'place-zhtw']"/>捷運車站一覽</title>
			</head>
			<body>
				<table>
					<thead>
						<tr><th>🇹🇼繁體中文</th><th>🇺🇸🇬🇧英文</th><th>🇯🇵日文</th><th>🇰🇵韓文</th><th>轉乘</th></tr>
					</thead>
					<xsl:for-each select="mrt/line">
						<tbody>
							<tr style="background: {@line-color-bg}; color: {@line-color-fg};" id="{@line-id}">
								<td><xsl:value-of select="line-name-zhtw"/></td>
								<td><xsl:value-of select="line-name-en"/>  </td>
								<td><xsl:value-of select="line-name-ja"/>  </td>
								<td><xsl:value-of select="line-name-ko"/>  </td>
								<td></td>
							</tr>
							<xsl:for-each select="mrt/line/station">
								<tr>
									<td><xsl:value-of select="mrt/line/station/sta-name-zhtw"/></td>
									<td><xsl:value-of select="mrt/line/station/sta-name-en"/>  </td>
									<td><xsl:value-of select="mrt/line/station/sta-name-ja"/>  </td>
									<td><xsl:value-of select="mrt/line/station/sta-name-ko"/>  </td>
									<td>
										<xsl:for-each select="mrt/line/station/transfers/transfer">
											<div>
												<xsl:value-of select="transfer-line"/>
												<xsl:value-of select="transfer-line-sta"/>
											</div>
										</xsl:for-each>
									</td>
								</tr>
							</xsl:for-each>
						</tbody>
					</xsl:for-each>
				</table>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>