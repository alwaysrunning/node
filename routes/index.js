module.exports = function(app){

	app.get('/register', function(req, res){
		res.render("register");
	})

	app.post('/register', function(req, res){
		var User = global.dbHelper.getModel('user'),
			uname = req.body.uname;
		User.findOne({name: uname}, function(error, doc){
			if(error){
				req.session.error = '网络异常错误！';
				res.send(500);
                console.log(error);
			}else if(doc){
				req.session.error = '用户已存在';
				res.send(500)
			}else{
				User.create({
					name: uname,
					password: req.body.upwd
				}, function(error,doc){
					if (error) {
                        res.send(500);
                        console.log(error);
                    } else {
                        req.session.error = '用户名创建成功！';
                        res.send(200);
                    }
				})
			}
		})
	});

	app.get('/login', function(req, res){
		res.render('login')
	})

	app.post('/login', function(req, res){
		var User = global.dbHelper.getModel('user'),
			uname = req.body.uname;
		User.findOne({name: uname}, function(error, doc){
			if(error){
				req.session.error = '网络异常错误！'
				res.send(500);
			}else if(!doc){
				req.session.error = '用户不存在'
				res.send(500);
			}else{
				if(req.body.upwd!=doc.password){
					req.session.error = '密码不正确'
					res.send(500);
				}else{
					req.session.user = doc
					res.send(200);
				}
			}
		})
	})

	app.get('/home', function(req, res){
		if(req.session.user){
			var Commodity = global.dbHelper.getModel('commodity');
			Commodity.find({}, function(err, docs){
				if(err){
					res.send(500);
					req.session.error = '网络异常错误！'
				}else{
					res.render('home',{Commoditys: docs});
				}
			})
		}else{
			req.session.error = '请重新登录';
			res.redirect('/login');
		}
	})

	app.get('/addcommodity', function(req, res){
		res.render("addcommodity")
	});

	app.post('/addcommodity', function(req, res){
		var Commodity = global.dbHelper.getModel('commodity');
		Commodity.findOne({name: req.body.name}, function(err, doc){
			if(err){
				req.session.error = '网络异常错误！'
				res.redirect('/home');
			}else{
				if(doc){
					var _id = doc._id;

					// 方法1
					/*delete doc._id;
					doc.price = req.body.price;
					doc.imgSrc = req.body.imgSrc;
					Commodity.update({_id: _id}, doc, function(err){
						if(err) return

						res.send(200);
						console.log("修改成功")
					})*/
					// 方法2
					/*doc.price = req.body.price;
					doc.save(function(err){
						res.send(200)
						console.log("修改成功")
					})*/

					// 方法3
					Commodity.update({_id:_id}, {$set: {price:req.body.price}}, function(err){
						res.send(200)
						console.log("修改成功")
					})

				}else{
					Commodity.create({
						name: req.body.name,
            			price: req.body.price,
            			imgSrc: req.body.imgSrc
					}, function(error, doc){
						if (doc) {
			                res.send(200);
			            }else{
			                res.send(404);
			            }
					})
				}
			}
		})
	})

	app.get('/cart', function(req,res){
		if(!req.session.user){
			req.session.error = '用户已过期,请重新登录';
			res.redirect('/login')
		}else{
			var Cart = global.dbHelper.getModel("cart");
			Cart.find({uId:req.session.user._id, cStatus: false}, function(err, docs){
				res.render('cart',{carts: docs})
			})
		}	
	})

	app.get("/addToCart/:id",function(req, res){
		if(!req.session.user){
			req.session.error = '用户已过期,请重新登录';
			res.redirect('/login')
		}else{
			var id = req.params.id;
			var Cart = global.dbHelper.getModel('cart');
			Cart.findOne({uId:req.session.user._id, cId:id}, function(err, doc){
				if(doc){
					if(doc.cRepeat){
						Cart.update({uId: req.session.user._id, cId:id}, {$set: {cQuantity:1,cStatus:false,cRepeat:false}}, function(err, doc){
							res.redirect("/home")
						})
					}else{
						Cart.update({uId: req.session.user._id, cId:id}, {$set: {cQuantity:doc.cQuantity+1}}, function(err, doc){
							res.redirect("/home")
						})
					}				
				}else{
					var Commodity = global.dbHelper.getModel('commodity');
					Commodity.findOne({_id: id}, function(err, cmt){
						if(cmt){
							Cart.create({
								uId: req.session.user._id,
						        cId: id,
						        cName: cmt.name,
						        cPrice: cmt.price,
						        cImgSrc: cmt.imgSrc,
						        cQuantity: 1
							}, function(err){
								res.redirect("/home")
							})
						}
						
					})
					
				}
			})
		}
	})

	app.post("/cart/clearing", function(req, res){
		var cid = req.body.cid, cnum = req.body.cnum,
		Cart = global.dbHelper.getModel('cart');
		Cart.update({_id:cid}, {$set: {cQuantity:cnum, cStatus: true, cRepeat: true}}, function(err, doc){
			if(doc>0){
				res.send(200);
			}
		})
	})

	app.get("/delFromCart/:id", function(req, res){
		var Cart = global.dbHelper.getModel('cart');
		Cart.remove({_id:req.params.id}, function(err, doc){
			if(doc){
				res.redirect("/cart")
			}
		})
	})

	app.get("/logout", function(req, res){
		req.session.user = null;
		req.session.error = "成功退出登录"
		res.redirect("/login")
	})
}