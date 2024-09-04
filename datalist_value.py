def datalist(tabs,data):
    for i in range(len(data)):
        print('\t'*tabs+'<option value="'+str(data[i])+'">'+str(data[i])+'</option>')
data=[]
tabs=eval(input('tabs :'))
while True:
    input_value=input('input value *-1 exit* :')
    if input_value=='-1':
        break
    data.append(input_value)
datalist(tabs,data)