# 面向对象编程OOP

*在我们的现实世界中，万物皆对象，世界由一个一个具体的对象构成；  
所有对象都可以拥有属性和方法，具体的对象拥有具体的属性和方法，而不同的对象它们的属性和方法不一样。*

> 举个栗子：  
红米note3（一个具体的对象）屏幕5.5（属性），可以指纹解锁（方法）；  
小志（一个具体的对象）高175（属性），会打篮球（方法）。

在javascript程序中，正是把这种思想映射在程序中，每个对象都是一个自成一体的实体，往往对应真实世界中的事物或软件功能，面向对象编程的基本内容离不开对象的定义和访问

1. **定义一个对象**

    - 定义一个对象，最简单的方式就是用**对象直接量标记法**，将属性（数据）和方法（函数）打包成为一个对象
    - 然后将对象赋值给一个变量，保存在内存中，用变量来指向内存中的这个对象
    - 所以命名变量时最好具有描述性，属性名和方法名也一样（[参考命名规范](convention.md)）

	```javascript
	// 格式：{key: value}
	// 键值对（key: value）用于来描述对象的属性和方法
	// 类比我们现实世界中的小志
	var xiaomzhi = {
	    name: '小志',
	    height: 175,
	    ability: function() {
	        alert('打篮球');
	    }
	};
	```

2. **访问对象**

    - 在代码中，通过变量名可以访问保存在内存中的对象
    - 使用点标记法（.）读写对象的属性和方法
    - 调用对象的方法与调用函数一样，在方法名（函数名）后面加()

    ```javascript
    alert(xiaomzhi.name);// 小志
    xiaomzhi.ability();// 打篮球

    // 动态添加一个weight为160的属性
    xiaomzhi.weight = 160;

    alert(xiaomzhi.weight);// 160

    /*
     * 这样的代码逻辑很符合我们理解的现实世界，程序就变得很友好，容易阅读和理解
     * 本人习惯将不同性质的代码分隔开
     * 比如把对象的定义和访问分隔开，也就是代码的定义和执行分开
     * 注释的位置也有癖好，输出结果写在代码右边，程序说明写在代码上面
     */
    ```

*很多传统编程语言（如java）以OOP技术为核心，具有类的概念，有专门定义类的特定关键字和语法结构，通过类来完成一系列复杂的面向对象编程逻辑，使得代码的重用性大大提高，程序更加健壮；*

与传统的面向对象语言不同的是，javascript是通过构造函数来实现类的特性，虽然符合传统编程语言的面向对象原则，但又不遵循那些严格而刻板的语法结构和编程惯例，反而更加灵活，更像是**函数式编程**；  
我建议你先去了解一下java的面向对象编程，并且希望你能辩证地去思考它们两者各自的魅力；  
那么接下来，让我们一起通过下面详细有序的介绍来体会这种函数式编程吧！


1. **原型**

    *物以类聚，人以群分，相似的东西总可以归为一类，然后为这类东西抽象化出一个原型，这个原型可以描述这类东西共有的性质；  
    比如小林、小鑫都在上学，他们都是学生，那么学生就是他们的原型，学生上学就变成了小林小鑫共同的性质了；  *

    javascript程序中也一样，把具有相似属性和方法的对象看做同一类，然后为这类对象抽象化出一个原型，这个原型具有这类对象共有的属性和方法；  
    也就是说，原型可以被一类对象共享，那么原型在代码中如何体现？请看下一节，通过定义一个构造函数生成。

2. **构造函数**

    - 构造函数与普通函数没有区别，通常我们会在命名时加以区别（[参考命名规范](convention.md)）
    - 然后使用**new关键字**调用这个构造函数，就可以创建一个对象，由同一个构造函数创建的所有对象互相独立，并且共享由构造函数生成的原型，这样一来，我们不需要手工式地去定义一个又一个对象，我们可以通过定义一个构造函数来工厂式地创建对象
    - 被创建的所有对象实例有一个**constructor属性**，指向使用new关键字调用的构造函数，按理来说可以使用这个属性再次创建一个对象，但constructor属性常用于判断对象是否是由某个构造函数被new关键字调用创建的；  
    **注意**：*在javascript中，也是万物皆对象，这点刚开始不是太好理解，主要是javascript根据常用的一些对象，内建了一些构造函数（比如String、Object、Math），并且分门别类，根据我们保存在内存中的变量类型，自动归类（比如String对象类型、Object对象类型、Math对象类型）；  
    我们可以通过了解这些不同对象类型的属性和方法，从而编写出功能强大的程序。*

    ```javascript
    // 构造函数其实就是一个函数，javascript有内建Function类型，所以我们需要用一个变量保存在内存中
    // 同样的，通过变量名访问或调用
    // 此时的构造函数没有为原型定义任何属性和方法
    function House() {}

	var apartment = new House();
	var hotel = new House();

	alert(apartment == hotel);// false
    alert(apartment.constructor == House);// true

	var school = new apartment.constructor();

	alert(school.constructor == House);// true
	```

3. **this关键字和上下文**

	- **this关键字**代表一个函数的上下文环境，这个上下文环境一般指函数运行时封装这个函数的那个对象，即this指向的是一个对象
	- 暴露在全局作用域中的this关键字和函数中的this，指向全局window对象
	- 在对象的方法中，this指向这个对象
	- 对象中的嵌套方法，内层方法的this指向全局window对象，可以在外层方法用变量that保存this指向的当前对象，在内层方法中使用that来代表该对象
	- 构造函数同样拥有上下文和函数作用域，所以使用new关键字调用构造函数创建对象时，构造函数中的this指向这个被创建的对象

## 设置原型的属性和方法

1. **通过构造函数的函数作用域设置**
	- 函数体内定义的变量和函数的作用域限于函数体内，它们属于函数作用域，在函数体外无法访问这些变量和函数
	- 对这些变量和函数来说，包裹它们的函数提供了一个沙箱般的编程环境，或者说一个**闭包**，所以函数与函数之间可以具有同名的变量，互相不会影响
	- 如果变量和函数直接暴露（javascript文件或html中的`<script>`内），那么它们属于全局作用域，在代码的任何地方都可以访问，包括其他函数体内
	- 根据作用域原则，嵌套函数可以访问外层函数的变量
	- **this关键字**代表一个函数的上下文环境，函数中的this一般指向包含函数的那个对象，暴露在全局作用域中的this或者函数中的this指向全局window对象，嵌套函数中内层函数的this指向全局window对象
	- 所以使用new关键字调用构造函数创建的对象时，构造函数中定义的this指向这个被创建的对象
	- 对象中可以在外层函数用that保存this指向的当前对象，在内层函数中使用that来代表该对象

	```javascript
	alert(this == window);//true
	function alarm() {
		alert(this == window);
	}
	alarm();//true

	function House() {
		this.isLock = false;
		this.alarm = function() {
			var that = this;
			function alerted() {
		        if(that.isLock == false) {
		            alert('the room is not lock,please lock your rooms');
		        }
			}
			alerted();
		};
	}

	var apartment = new House();

	apartment.alarm();//the room is not lock,please lock your rooms
	```

2. **通过构造函数的prototype属性设置**
	- 构造函数有一个**prototype属性**，指向原型
	- 所以可以使用prototype属性为原型设置属性和方法
	- 如果对象已经被创建，这个对象同样拥有原型这些新添加的属性和方法，这就是**原型的共享机制**

	```javascript
	function House() {}

	House.prototype = {
		rooms: 2,
		floors: 1,
		lock: function() {
		    alert('your room is lock');
		}
	};

	var apartment = new House();

	House.prototype.isLock = false;

	alert(apartment.rooms);// 2
	alert(apartment.isLock);// false
	```

3. 结合this关键字与prototype属性设置原型的属性和方法
	- 每次通过构造函数创建一个对象时，构造函数都会被执行一次
	- 使用this关键字可以在构造函数内部设置属性的**初始化值**，调用构造函数创建对象时通过传递参数设置对象具体的属性值
	- 用prototype设置其他不需要在调用构造函数时执行初始化的属性和方法，如此一来，对象的创建变得更加高效

	```javascript
	function House(rooms, floors, shareEntrance) {
		this.rooms = rooms || 0;//当没有传入具体值，则赋值为初始值
		this.floors = floors || 0;
		this.shareEntrance = shareEntrance || false;
	}
	House.prototype.isLock = false;
	House.prototype.alarm = function() {
	    if(this.isLock == false) {
	        alert('the room is not lock,please lock your rooms');
	    }
	};
	```

4. 给构造函数传一个defaults对象

	- 给构造函数传递一系列参数值以创建对象时初始化属性值，当参数值大于3个以上可以把初始值定义为一个对象的属性值传入，作为唯一的参数。不但消除了多个参数带来的不便，也使代码变得清晰易懂，一般命名为defaults

	```javascript
	function House(defaults) {
	    defaults = defaults || {};//当传入值为空时指定一个默认值，即一个空对象
		this.rooms = defaults.rooms || 0;
		this.floors = defaults.floors || 0;
		this.shareEntrance = this.shareEntrance || false;
	}
	House.prototype.isLock = false;

	var apartment = new House({
		rooms: 5,
		floors: 2,
		shareEntrance: false
	});
	document.write(apartment.rooms);//5
	```

## 原型的高级使用
    
*在第一节中对原型的解释只是一种简单的情况，然而很多时候，由于时间、空间或者其他因素，一件东西往往拥有多种属性和方法，也就是说，一类事物与另一类事物可能还存在着一些联系；  
比如小志在读书是学生，在工作是工人；学生可以读书，工人也可以读书；小志不仅在读书的时候打球，在工作的时候也打球；*  
在javascript程序中，体现为一类对象与另一类对象可能存在一定的联系，有了原型的抽象化，我们只需要关心原型与原型之间的联系即可  
而这种联系的实现就是原型的继承，一个原型可以继承另一个原型的属性和方法

1. 原型继承

	- 如果把某个构造函数创建的对象赋值给一个原型，那么这个原型会共享另一个原型
	- 通过原型继承，便会形成原型链
	- **instanceof关键字**可以沿着原型链（一直追溯到javascript内建的Object，因为javascript中所有变量最终都继承Object）向上检查对象是否是某个构造函数创建的对象

	```javascript
	function House() {}
	function Accommodation() {}
	Accommodation.prototype.isLock = false;

	House.prototype = new Accommodation();
	alert(House.prototype.constructor == Accommodation);//true

	alert(House.prototype.constructor == House);//false

	var apartment = new House();
	alert(apartment.isLock);//false
	alert(apartment.constructor == Accommodation);//true
	alert(apartment.constructor == House);//false

	House.prototype.constructor = House;
	alert(House.prototype.constructor == Accommodation);//false

	alert(apartment.constructor == Accommodation);//false
	alert(apartment.constructor == House);//true

	alert(apartment instanceof House);//true
	alert(apartment instanceof Object);//true
	```

	- 如果我们访问对象的某个属性或方法，但构造函数的对象模板没有这个属性或方法，javascript会沿着原型链向上检查父构造函数是否包含

2. 多态

## 链式调用对象的方法

*如果需要连续调用对象的多个方法，可以采用链式调用，在一个语句内完成多个方法的调用；  
只需在定义对象的方法时，在每个方法的最后返回该对象，就可以实现调用完一个方法后紧跟着继续调用下一个方法*

那么如何在对象的方法中返回该对象呢？请看下一节this关键字和上下文！！

```javascript
var xiaozhi = {
    name: '小志',
    height: 175,
    ability: function() {
        alert('打篮球');
        return this;
    },
    myName: function() {
        alert('我的名字叫' + this.name);
        return this;
    }
};

// 因此，只需要在方法的最后返回this，即可实现对象方法的链式调用
xiaozhi.ability().myName();
```

```JavaScript
function House(defaults) {
    defaults = defaults || {};
	this.rooms = defaults.rooms || 0;
	this.floors = defaults.floors || 0;
	this.shareEntrance = this.shareEntrance || false;
}
House.prototype.isLock = false;
House.prototype.lock = function() {
	this.isLock = true;
	return this;
};
House.prototype.unlock = function() {
	this.isLock = false;
	return this;
};
House.prototype.alarm = function() {
	if(this.isLock == true) {
	    alert('the room is lock');
    }else{
        alert('the room is not lock');
    }
    return this;
};

var apartment = new House({
	rooms: 5,
	floors: 2,
	shareEntrance: false
});
apartment.alarm().lock().alarm();//the room is not lock->the room is lock
```