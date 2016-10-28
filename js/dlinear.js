  var GRAD_SPEED = 0.15;
  var BAR_SPEED = 0.35;
  var env = {
      anim: 0,
      size: 500,
      coef: 0,
      start: false,
      curr: 0,
      max: 0
  };
  var bar_pos = {
      x: 219,
      y: 160
  };
  var metals = [{
      size_b: "images/barra_aco_b.png",
      size_c: "images/barra_aco_c.png",
      size_d: "images/barra_aco_d.png",
      coef: 17e-6,
  }, {
      size_b: "images/barra_cobre_b.png",
      size_c: "images/barra_cobre_c.png",
      size_d: "images/barra_cobre_d.png",
      coef: 11e-6,
  }, {
      size_b: "images/barra_latao_b.png",
      size_c: "images/barra_latao_c.png",
      size_d: "images/barra_latao_d.png",
      coef: 19e-6,
  }];
  var bg_offset = {
      x: 0,
      y: 0
  };

  var plug_targets = [{
      name: 'b',
      img: "images/conector_b.png",
      size: 500,
      x: 744,
      y: 256
  }, {
      name: 'c',
      img: "images/conector_c.png",
      size: 400,
      x: 749,
      y: 256
  }, {
      name: 'd',
      img: "images/conector_d.png",
      size: 300,
      x: 658,
      y: 256
  }];

  $(document)
      .ready(function() {

          var stage = new createjs.Stage("canvas");
          $("#scale").val("3");
          $("#scale").on("change", function() {
              var children = stage.children;
              for (var i = 0; i < children.length; i++) {
                  children[i].scaleX = children[i].scaleY = getScale($(this).val());
              }
          });
          $("#btn_start").on("click", function() {
              if (env.start)
                  return;
              disableControlls(stage);
              env.start = true;
          });

          var bg_container = new createjs.Container();
          var med_container = new createjs.Container();
          med_container.name = "medidor";
          med_container.reset = function() {
              this.x = this.dfX;
              this.y = this.dfY;
          };
          var mbar_container = new createjs.Container();
          mbar_container.name = "barra";
          var bar_container = new createjs.Container();
          bar_container.name = "medidor_barra";
          bar_container.reset = function() {
              this.x = this.dfX;
              this.y = this.dfY;
          };
          var plug_container = new createjs.Container();
          mbar_container.tickChildren = plug_container.tickChildren = bg_container.tickChildren = false;
          var grad_container = new createjs.Container();
          grad_container.name = "grad";
          grad_container.reset = function() {
              this.x = this.dfX;
              this.y = this.dfY;
          };
          var view_container = new createjs.Container();
          view_container.reset = function() {
              this.x = this.dfX;
              this.y = this.dfY;
          };
          view_container.name = "view";
          var vapor_container = new createjs.Container();
          vapor_container.reset = function() {
              this.alpha = 0;
          };
          vapor_container.name = "vapor";
          stage.addChildAt(bg_container, 0);
          stage.addChildAt(med_container, 1);
          stage.addChildAt(mbar_container, 2);
          stage.addChildAt(bar_container, 3);

          stage.addChildAt(grad_container, 4);
          stage.addChildAt(plug_container, 5);
          stage.addChildAt(view_container, 6);
          stage.addChildAt(vapor_container, 6);

          stage.mouseMoveOutside = true;
          var bg = new createjs.Bitmap("images/regua.png");
          bg_container.y = 100;
          bg_container.x = 6;
          bg_offset.y = bg_container.y;
          bg_offset.x = bg_container.x;
          bg_container.addChild(bg);

          setupDragBtn(stage, plug_container);
          setupDragBar(stage, mbar_container);
          setupDragMed(stage, med_container);
          setupDragMBar(stage, bar_container);
          setupDragGrad(stage, grad_container);
          setupDragView(stage, view_container);
          setupDragVapor(stage, vapor_container);

          createjs.Ticker.addEventListener("tick", function(event) {
              stage.update(event);
          });

          $("#scale").trigger("change");
          $('#metal_size').trigger("change");
          $('#metal_type').trigger("change");


      });

  setupDragBtn = function(stage, layer) {

      var button = null;
      $('#metal_size').on('change', function() {
          if (env.start)
              return;
          var val = $(this).val();
          var point = plug_targets[val];
          if (button) {
              layer.removeChild(button);
          }
          button = new createjs.Bitmap(point.img);
          layer.addChild(button);
          layer.x = point.x;
          layer.y = point.y;
          env.size = point.size;
          $('#metal_type').trigger("change");
      });
      // return button;
      // var dragger_button = new createjs.Container();
      // dragger_button.addChild(button);
      // stage.addChild(dragger_button);
      // dragger_button.x = bg_offset.x + 936.5;
      // dragger_button.y = bg_offset.y + 157;
      // dragger_button.on("mousedown", function(evt) {
      //     if (true)
      //         return;
      //     var ct = evt.currentTarget,
      //         local = ct.globalToLocal(evt.stageX, evt.stageY),
      //         nx = ct.regX - local.x,
      //         ny = ct.regY - local.y;
      //     //set the new regX/Y
      //     ct.regX = local.x;
      //     ct.regY = local.y;
      //     //adjust the real-position, otherwise the new regX/Y would cause a jump
      //     ct.x -= nx;
      //     ct.y -= ny;
      // });
      //
      // dragger_button.on("pressmove", function(evt) {
      //     // currentTarget will be the container that the event listener was added to:
      //     evt.currentTarget.x = evt.stageX;
      //     evt.currentTarget.y = evt.stageY;
      //     console.log("Barra posX: " + evt.stageX + ", posY: " + evt.stageY);
      //     // make sure to redraw the stage to show the change:
      //     stage.update();
      // });
  };

  setupDragBar = function(stage, layer) {
      var bar = null;
      $('#metal_type').on('change', function() {
          if (env.start)
              return;
          var val = $(this).val();
          var newImg = null;
          var metal = metals[val];
          switch (env.size) {
              case 500:
                  newImg = metal.size_b;
                  break;
              case 400:
                  newImg = metal.size_c;
                  break;
              case 300:
                  newImg = metal.size_d;
                  break;
          }

          if (bar) {
              layer.removeChild(bar);
          }
          bar = new createjs.Bitmap(newImg);
          layer.addChild(bar);
          layer.x = bg_offset.x + bar_pos.x;
          layer.y = bg_offset.y + bar_pos.y;
          env.coef = metal.coef;
          stage.getChildByName("view").reset();
          stage.getChildByName("medidor").reset();
          stage.getChildByName("medidor_barra").reset();
          stage.getChildByName("grad").reset();
          //bar.scaleX = bar.scaleY = getScale($('#scale').val());
      });
      // var dragger_bar = new createjs.Container();
      // dragger_bar.addChild(bar);
      // stage.addChild(dragger_bar);
      // dragger_bar.x = 100;
      // dragger_bar.y = 100;
      // dragger_bar.on("mousedown", function(evt) {
      //   if(true) return;
      //     var ct = evt.currentTarget,
      //         local = ct.globalToLocal(evt.stageX, evt.stageY),
      //         nx = ct.regX - local.x,
      //         ny = ct.regY - local.y;
      //     //set the new regX/Y
      //     ct.regX = local.x;
      //     ct.regY = local.y;
      //     //adjust the real-position, otherwise the new regX/Y would cause a jump
      //     ct.x -= nx;
      //     ct.y -= ny;
      // });
      //
      // dragger_bar.on("pressmove", function(evt) {
      //     // currentTarget will be the container that the event listener was added to:
      //     evt.currentTarget.x = evt.stageX;
      //     evt.currentTarget.y = evt.stageY;
      //     console.log("Barra posX: " + evt.stageX + ", posY: " + evt.stageY);
      //     // make sure to redraw the stage to show the change:
      //     stage.update();
      // });
  };

  setupDragGrad = function(stage, layer) {
      var animMatrix = [{
          colors: ["#ffff00", "#f9b105"],
          ratio: [0, 1],
      }, {
          colors: ["#ffff00", "#f9b105", '#f94f05'],
          ratio: [0, 0.45, 1],
      }, {
          colors: ["#ffff00", "#f9b105", '#f94f05', "#cc0000"],
          ratio: [0, 0.30, 0.45, 1],
      }];
      var shape = new createjs.Shape();
      //Grad posX: 391, posY: 495.81766777941993
      var max_w = 1190,
          curr_w = 45,
          accm = 30;
      shape.graphics.drawRect(0, 0, curr_w, 47);
      layer.reset = function() {
          shape.graphics.clear();
          shape.graphics.drawRect(0, 0, curr_w, 47);
      };
      shape.on("tick", function(event) {
          if (env.start) {
              var vapor = stage.getChildByName("vapor");
              curr_w = Math.round(curr_w + event.delta * GRAD_SPEED);
              curr_w = curr_w > 1190 ? 1190 : curr_w;
              var step = env.anim;
              switch (step) {
                  case 0:
                      calcGradAnim(curr_w);
                      shape.graphics.clear();
                      shape.graphics.beginLinearGradientFill(animMatrix[step].colors, animMatrix[step].ratio, 0, 0, curr_w, 47);
                      shape.graphics.drawRect(0, 0, curr_w, 47);
                      shape.graphics.endFill();
                      break;
                  case 1:
                      calcGradAnim(curr_w);
                      shape.graphics.clear();
                      shape.graphics.beginLinearGradientFill(animMatrix[step].colors, animMatrix[step].ratio, 0, 0, curr_w, 47);
                      shape.graphics.drawRect(0, 0, curr_w, 47);
                      shape.graphics.endFill();
                      if (vapor.alpha < 1)
                          vapor.alpha += 0.005;
                      break;
                  default:
                      calcGradAnim(curr_w);
                      step = step > 2 ? 2 : step;
                      shape.graphics.clear();
                      shape.graphics.beginLinearGradientFill(animMatrix[step].colors, animMatrix[step].ratio, 0, 0, curr_w, 47);
                      shape.graphics.drawRect(0, 0, curr_w, 47);
                      shape.graphics.endFill();
                      if (vapor.alpha < 1)
                          vapor.alpha += 0.01;
                      //console.log(env.anim);
                      break;
              }

              if (env.anim > 2) {

                  if (env.curr === 0) {

                      env.curr = env.coef * env.size * 10;
                      env.max = env.coef * env.size * 75;
                      //console.log(env.max);
                      env.toText.text = env.curr.toFixed(5);
                      //console.log("Inicial curr:"+env.curr);
                  } else {
                      env.curr += (event.delta * BAR_SPEED) / 1000;
                      //console.log("OLD "+env.curr);
                      env.curr = env.curr >= env.max ? env.max : env.curr;
                      //console.log("NORM "+env.curr);
                      env.toText.text = env.curr.toFixed(5);
                      //console.log("Curr:"+env.curr);
                  }
                  var barra = stage.getChildByName("barra");
                  var mbarra = stage.getChildByName("medidor_barra");
                  var medidor = stage.getChildByName("medidor");

                  var mov = (event.delta * env.coef) * 100;
                  barra.x -= mov;
                  mbarra.x -= mov;
                  medidor.x -= mov;
                  if (vapor.alpha < 1)
                      vapor.alpha += 0.25;
                  accm += 0.25;

                  calcBarAnim(env.curr, env.max);

                  if (env.anim > 6) {
                      env.start = false;
                      curr_w = 45;
                      accm = 30;
                      env.anim = 0;
                      env.curr = 0;
                      env.max = 0;
                      enableControlls(stage);
                  }
              }

          }
      });
      //shape.graphics.drawRect(0, 0, 1190, 47);
      layer.addChild(shape);
      layer.x = 391;
      layer.y = 495.81766777941993;
      //#0000ff, #b3b3ff
      //#ffff00, #cc0000
      // layer.on("mousedown", function(evt) {
      //     if (true) return;
      //     var ct = evt.currentTarget,
      //         local = ct.globalToLocal(evt.stageX, evt.stageY),
      //         nx = ct.regX - local.x,
      //         ny = ct.regY - local.y;
      //     //set the new regX/Y
      //     ct.regX = local.x;
      //     ct.regY = local.y;
      //     //adjust the real-position, otherwise the new regX/Y would cause a jump
      //     ct.x -= nx;
      //     ct.y -= ny;
      // });
      //
      // layer.on("pressmove", function(evt) {
      //     // currentTarget will be the container that the event listener was added to:
      //     evt.currentTarget.x = evt.stageX;
      //     evt.currentTarget.y = evt.stageY;
      //     console.log("Grad posX: " + evt.stageX + ", posY: " + evt.stageY);
      //     // make sure to redraw the stage to show the change:
      //     stage.update();
      // });
  };

  setupDragMed = function(stage, layer) {
      //Barra posX: 190, posY: 182.3190546363229
      var med = new createjs.Bitmap("images/medidor.png");
      layer.addChild(med);
      layer.x = 190;
      layer.y = 182;
      layer.dfX = layer.x;
      layer.dfY = layer.y;
      // var dragger_med = new createjs.Container();
      // dragger_med.addChild(med);
      // stage.addChild(dragger_med);
      // dragger_med.x = 190;
      // dragger_med.y = 182;
      // dragger_med.on("mousedown", function(evt) {
      //     if (true)
      //         return;
      //     var ct = evt.currentTarget,
      //         local = ct.globalToLocal(evt.stageX, evt.stageY),
      //         nx = ct.regX - local.x,
      //         ny = ct.regY - local.y;
      //     //set the new regX/Y
      //     ct.regX = local.x;
      //     ct.regY = local.y;
      //     //adjust the real-position, otherwise the new regX/Y would cause a jump
      //     ct.x -= nx;
      //     ct.y -= ny;
      // });
      //
      // dragger_med.on("pressmove", function(evt) {
      //     // currentTarget will be the container that the event listener was added to:
      //     evt.currentTarget.x = evt.stageX;
      //     evt.currentTarget.y = evt.stageY;
      //     console.log("Barra posX: " + evt.stageX + ", posY: " + evt.stageY);
      //     // make sure to redraw the stage to show the change:
      //     stage.update();
      // });
  };

  setupDragMBar = function(stage, layer) {
      //Barra posX: 248, posY: 187.32781987358453
      var mbar = new createjs.Bitmap("images/barra.png");
      layer.addChild(mbar);
      layer.x = 248;
      layer.y = 187;
      layer.dfX = layer.x;
      layer.dfY = layer.y;
      // var dragger_mbar = new createjs.Container();
      // dragger_mbar.addChild(mbar);
      // stage.addChild(dragger_mbar);
      // dragger_mbar.x = 248;
      // dragger_mbar.y = 187;
      // dragger_mbar.on("mousedown", function(evt) {
      //     if (true)
      //         return;
      //     var ct = evt.currentTarget,
      //         local = ct.globalToLocal(evt.stageX, evt.stageY),
      //         nx = ct.regX - local.x,
      //         ny = ct.regY - local.y;
      //     //set the new regX/Y
      //     ct.regX = local.x;
      //     ct.regY = local.y;
      //     //adjust the real-position, otherwise the new regX/Y would cause a jump
      //     ct.x -= nx;
      //     ct.y -= ny;
      // });
      //
      // dragger_mbar.on("pressmove", function(evt) {
      //     // currentTarget will be the container that the event listener was added to:
      //     evt.currentTarget.x = evt.stageX;
      //     evt.currentTarget.y = evt.stageY;
      //     console.log("Barra posX: " + evt.stageX + ", posY: " + evt.stageY);
      //     // make sure to redraw the stage to show the change:
      //     stage.update();
      // });
  };

  setupDragView = function(stage, layer) {
      var texto = new createjs.Text();
      var txtBG = new createjs.Shape();
      //View posX: 55, posY: 154.26996930765785
      texto.font = "bold 126px Digital";
      texto.color = "green";
      texto.text = "0.00000";
      txtBG.graphics.ss(10).s("#FFFFFF").f("#000000").rr(0, 0, 450, 250, 15);
      texto.on("tick", function(event) {
          if (env.start) {
              if (env.anim <= 2) {
                  texto.text = "0.00000";
              } else {
                  //texto.text = env.toText.toFixed(5);
              }
          }
      });
      layer.addChild(txtBG);
      layer.addChild(texto);
      texto.x = 90 - 55;
      texto.y = 200 - 154;
      layer.x = 55;
      layer.y = 154;
      layer.dfX = layer.x;
      layer.dfY = layer.y;
      layer.reset = function() {
          texto.text = "0.00000";
      };
      env.toText = texto;
      // layer.on("mousedown", function(evt) {
      //     if (true) return;
      //     var ct = evt.currentTarget,
      //         local = ct.globalToLocal(evt.stageX, evt.stageY),
      //         nx = ct.regX - local.x,
      //         ny = ct.regY - local.y;
      //     //set the new regX/Y
      //     ct.regX = local.x;
      //     ct.regY = local.y;
      //     //adjust the real-position, otherwise the new regX/Y would cause a jump
      //     ct.x -= nx;
      //     ct.y -= ny;
      // });
      //
      // layer.on("pressmove", function(evt) {
      //     // currentTarget will be the container that the event listener was added to:
      //     evt.currentTarget.x = evt.stageX;
      //     evt.currentTarget.y = evt.stageY;
      //     console.log("View posX: " + evt.stageX + ", posY: " + evt.stageY);
      //     // make sure to redraw the stage to show the change:
      //     stage.update();
      // });
  };

  setupDragVapor = function(stage, layer) {
      var texto = new createjs.Text();
      //Vapor posX: 845, posY: 410
      texto.font = "bold 126px Vaporized";
      texto.color = "blue";
      texto.text = "^ Vapor ^";
      layer.addChild(texto);
      layer.alpha = 0;
      layer.x = 845;
      layer.y = 410;
      layer.on("mousedown", function(evt) {
          if (true) return;
          var ct = evt.currentTarget,
              local = ct.globalToLocal(evt.stageX, evt.stageY),
              nx = ct.regX - local.x,
              ny = ct.regY - local.y;
          //set the new regX/Y
          ct.regX = local.x;
          ct.regY = local.y;
          //adjust the real-position, otherwise the new regX/Y would cause a jump
          ct.x -= nx;
          ct.y -= ny;
      });

      layer.on("pressmove", function(evt) {
          // currentTarget will be the container that the event listener was added to:
          evt.currentTarget.x = evt.stageX;
          evt.currentTarget.y = evt.stageY;
          console.log("Vapor posX: " + evt.stageX + ", posY: " + evt.stageY);
          // make sure to redraw the stage to show the change:
          stage.update();
      });
  };

  disableControlls = function(stage) {
      $('#metal_type').trigger("change");
      var mbarra = stage.getChildByName("medidor_barra");
      mbarra.reset();
      var medidor = stage.getChildByName("medidor");
      medidor.reset();
      $(".controll").prop('disabled', true);
  };

  enableControlls = function(stage) {
      stage.getChildByName("vapor").reset();
      $(".controll").prop('disabled', false);
  };

  calcGradAnim = function(w) {
      if (w >= 1190) {
          env.anim = env.anim == 2 ? 3 : env.anim;
          return;
      }

      if (w < (1190 * 30 / 100)) {
          env.anim = 0;
      } else if (w > (1190 * 30 / 100) && w < (1190 * 60 / 100)) {
          env.anim = 1;
      } else if (w > (1190 * 60 / 100)) {
          env.anim = 2;
      }

  };

  calcBarAnim = function(curr, max) {
      if (curr >= max) {
          env.anim = 7;
      }

  };

  getScale = function(s) {
      switch (s) {
          case '0':
              return 0.09;
          default:
              return parseFloat(s) / 10;
      }
  };
