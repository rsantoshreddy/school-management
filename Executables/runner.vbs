Set mongo = CreateObject("WScript.Shell")
mongo.Run chr(34) & "C:\Users\srabada\Desktop\openMongo.bat" & Chr(34), 0
Set mongo = Nothing
Set node = CreateObject("WScript.Shell")
node.Run chr(34) & "C:\Users\srabada\Desktop\openNode.bat" & Chr(34), 0
Set node = Nothing
Set browser = CreateObject("WScript.Shell")
browser.Run chr(34) & "C:\Users\srabada\Desktop\browser.bat" & Chr(34), 0
Set browser = Nothing