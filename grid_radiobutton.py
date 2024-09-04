def grid_radiobutton(x,y,pre='',tabs=0):
    print('\t'*tabs+'<table border="1">')
    for j in y:
        print('\t'*(tabs+1)+'<tr>')
        for i in x:
            print('\t'*(tabs+2)+'<td><input type="radio" name="'+pre+str(j)+'" value="'+pre+str(j)+'-'+str(i)+'" reqired/></td>')
        print('\t'*(tabs+1)+'</tr>')
    print('\t'*tabs+'</table>')
pre=input('pre:')
x=list(input('x:').split(','))
y=list(input('y:').split(','))
tabs=int(eval(input('tabs:')))
grid_radiobutton(x,y,pre,tabs)
