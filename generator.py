import json
from datetime import datetime


INSERT_LOCATOR = '<!-- generate -->'
FILE_ORG_NAME = 'index-raw.html'
FILE_NEW_NAME = 'index.html'
DATA_NAME = 'data.json'


class Map(dict):
    def __getitem__(self,key):
        return dict.get(self,key,'{'+key+'}')


class CommandData:
    def __init__(self,*,prefix='.rb '):
        self.prefix = str(prefix)
        self.sections = []
    def addSection(self,name):
        section = Section(name=name)
        self.sections.append(section)
        return section
    def format(self,string):
        return string.format_map(Map({'prefix':self.prefix}))
    def __str__(self):
        contents = '<h1>Commands</h1>'
        for section in self.sections:
            contents += section.contents()
        commands = ''
        for section in self.sections:
            commands += section.overview()
        text = contents + commands
        return self.format(text)

class Section:
    def __init__(self,*,name=''):
        self.name = str(name)
        self.commands = []
    def addCommand(self,name,description,permission):
        command = Command(name=name,description=description,permission=permission)
        self.commands.append(command)
        return command
    def format(self,string):
        return string.format_map(Map({'name':self.name}))
    def overview(self):
        text = '<div class="section"><h1>{name}</h1>'
        for command in self.commands:
            text += command.overview()
        text += '</div>'
        return self.format(text)
    def contents(self):
        text = '<table class="contents"><tbody><tr><th>{name}</th></tr>'
        for command in self.commands:
            text += command.contents()
        text += '</tbody></table>'
        return self.format(text)
    def __str__(self):
        text = 'Section: {name}'
        return self.format(text)


class Command:
    def __init__(self,*,name='',description='',arguments=[],permission=None):
        self.name = str(name)
        self.description = str(description)
        self.arguments = list(arguments)
        self.permission = permission
    def addArgument(self,name,possible,required):
        argument = Argument(name=name,possible=possible,required=required,position=len(self.arguments))
        self.arguments.append(argument)
        return argument
    def format(self,string):
        return string.format_map(Map({'name':self.name,'description':self.description,'permission':self.permission}))
    def overview(self):
        text = '<div class="command" id="command-{name}"><div class="command-name"><span class="command-name-command">{prefix}{name}</span> '
        for argument in self.arguments:
            text += argument.overview() + ' '
        text += '</div><div class="command-permission">{permission}</div><div class="command-description">{description}</div></div>'
        return self.format(text)
    def contents(self):
        text = '<tr><td><a href="#command-{name}">{prefix}{name}</a></td></tr>'
        return self.format(text)
    def __str__(self):
        text = 'Command: {name}'
        return self.format(text)


class Argument:
    def __init__(self,*,name='',possible=None,required=True,position=0):
        self.name = str(name)
        self.possible = possible
        self.required = bool(required)
        self.position = int(position)
    def format(self,string):
        if self.required:
            required = 'required'
        else:
            required = ''
        return string.format_map(Map({'name':self.name,'required':required}))
    def overview(self):
        text = '<span class="command-name-argument {required}">[{name}]<span class="command-name-argument-possible">'
        if self.required:
            t = 'Required'
        else:
            t = 'Not required'
        text += '<span class="command-name-argument-possible-item">{0}</span>'.format(t)
        if self.possible is not None:
            try:
                possible = list(self.possible)
                text += '<span class="command-name-argument-possible-item">One of:</span>'
                for item in possible:
                    text += '<span class="command-name-argument-possible-item">'
                    text += item
                    text += '</span>'
            except ValueError:
                pass
        text+= '</span></span>'
        return self.format(text)
    def __str__(self,*,use=None):
        text = 'Argument: {name}'
        return self.format(text)



def writeGenerated(original,new,data):
    file = open(original,'r')
    content = file.read()
    file.close()
    start = content.find(INSERT_LOCATOR)
    if start < 0:
        start = len(content)-1
        end = start
    else:
        end = start + len(INSERT_LOCATOR)
    before = content[:start]
    after = content[end:]
    middle = '\n<!-- generated at {1} -->\n{0}\n<!-- end of generated content -->\n'.format(data,datetime.utcnow().strftime('%H:%M:%S UTC%z %d/%m/%Y'))
    file = open(new,'w')
    file.write(before + middle + after)
    file.close()

def readJson(filename):
    file = open(filename,'r')
    c = file.read()
    file.close()
    j = json.loads(c)
    return j

def parseData(data):
    output = CommandData()
    for sectionName in data:
        section = output.addSection(sectionName)
        for commandData in data.get(sectionName,[]):
            command = section.addCommand(commandData.get('name'),commandData.get('description'),commandData.get('permission'))
            for argumentData in commandData.get('arguments',[]):
                argument = command.addArgument(argumentData.get('name'),argumentData.get('possible'),argumentData.get('required'))
    return output

def generate():
    data_raw = readJson(DATA_NAME)
    data = parseData(data_raw)
    writeGenerated(FILE_ORG_NAME,FILE_NEW_NAME,str(data))

if __name__ == '__main__':
    generate()
