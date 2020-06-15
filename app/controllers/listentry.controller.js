const db = require("../models");
const he = require("he");
const Listentry = db.listentries;
const List = db.lists;
const Board = db.boards;
const Shared_Board = db.shared_boards;
const Op = db.Sequelize.Op;


// Create a new listentry
exports.create = (req, res) => {
    if (!req.body.list_id || !req.body.title) {
        res.status(400).json({
            message: "list_id or title cannot be empty"
        });
    } else {
        const list_id = req.body.list_id;
        req.userData.list_id = list_id;
        checkListPerm(req, res, () => {
            const title = he.encode(req.body.title);
            Listentry.findAll({ where: { list_id: list_id }})
                .then(data => {
                    const order_number = data.length;
                    const listentry = {
                        list_id: list_id,
                        order_number: order_number,
                        title: title
                    };
                    Listentry.create(listentry)
                        .then(data => {
                            res.status(201).json(data);
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "Internal error occured while creating the listentry"
                            });
                        });
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Internal error occured while creating the listentry"
                    })
                });
        });
    }
};

exports.findAllByListId = (req, res) => {
    const list_id = req.params.list_id;
    if (!list_id) {
        res.status(400).json({
            message: "list_id cannot be empty"
        });
    } else {
        req.userData.list_id = list_id;
        checkListPerm(req,res, () => {
            Listentry.findAll({ where: { list_id: list_id }})
                .then(data => {
                    res.status(200).json(data);
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Internal error occured while getting listentries"
                    });
                })
        });
    }
}

exports.findAllByBoardId = (req, res) => {
    const board_id = req.query.board_id;
    if (!board_id) {
        res.status(400).json({
            message: "board_id cannot be empty"
        });
    } else {
        List.findAll({ where: { board_id: board_id }, attributes: ["id"] })
            .then(listids_raw => {
                var listids = listids_raw.map(el => el.id);
                Listentry.findAll({ where: { list_id: { [Op.in]: listids }}})
                    .then(data => {
                        res.status(200).json(data);
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "Internal error occured while getting listentries"
                        });
                    });
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal error occured while getting List data"
                })
            });
    }
};

// Change order of listentry
exports.updateOrder = (req, res) => {
    if (!req.body.id || !req.body.upperId || !req.body.list_id){
        res.status(400).json({
            message: "id, upperid or list_id cannot be empty"
        });
    } else {
        const id = req.body.id;
        const upperId = req.body.upperId;
        const list_id = req.body.list_id;
        req.userData.list_id = list_id;
        checkListPerm(req, res, () => {
            Listentry.findByPk(id)
                .then(data => {
                    if (!data.id){
                        res.status(404).json({
                            message: `A listentry with the specified id: ${id} was not found`
                        });
                    } else {
                        if (data.list_id == list_id && upperId == -1 && data.order_number == 0){
                            res.status(304).json({
                                message: "Order not modified"
                            });
                        } else {
                            // Listentry.findByPk(upperId)
                            //     .then(upper_data => {                                    
                                    // if(upper_data.order_number == null || upper_data.order_number == undefined){                                        
                                    //     res.status(404).json({
                                    //     message: `A listentry with the id: ${upperId} was not found`
                                    //     });
                                    // } else {
                                        // if (upper_data.order_number == data.order_number -1){
                                        //     res.status(304).json({
                                        //         message: "Order not modified"
                                        //     });
                                        // } else {
                                            if (upperId < 0) {
                                                Listentry.update({ order_number: 0 }, { where: { id: id }})
                                                    .then(data => {
                                                        var oldListId = data.list_id
                                                        if (oldListId != list_id){
                                                            updateListId(list_id, id);
                                                        }
                                                        Listentry.increment({ order_number: 1 }, { where: {list_id: list_id, id: { [Op.ne]: id }, order_number: { [Op.gte]: 0 }}})
                                                            .then(data => {
                                                                cleanOrderNumbers(oldListId, list_id, res);
                                                            })
                                                            .catch(err => {
                                                                res.status(500).json({
                                                                    message: "Internal error occured while incrementing order_numbers"
                                                                });
                                                            });
                                                    })
                                                    .catch(err => {
                                                        res.status(500).json({
                                                            message: "Internal error occured while updating listentry"
                                                        });
                                                    });
                                            } else {
                                                // Find listentry:upperid -> listentry(id): order: orderNumber(upperid)+1
                                                // Increment orderNr where listid=listid, orderNumber >= orderNumber(upperid)+1, id != id
                                                // CleanorderNumbers
                                                Listentry.findByPk(upperId)
                                                    .then(data => {
                                                        if (!data.id) {
                                                            res.status(404).json({
                                                                message: `A listentry with the id: ${upperId} was not found`
                                                            });
                                                        } else {
                                                            Listentry.update({ order_number: data.order_number + 1}, { where: { id: id }})
                                                                .then(data => {
                                                                    Listentry.findByPk(id)
                                                                        .then(data => {
                                                                            var oldListId = data.list_id;
                                                                            if (oldListId != list_id){
                                                                                updateListId(list_id, id);
                                                                            }
                                                                            Listentry.increment({ order_number: 1}, { where: {id: { [Op.ne]: id }, list_id: list_id, order_number: { [Op.gte]: data.order_number }}})
                                                                                .then(data => {
                                                                                    cleanOrderNumbers(oldListId, list_id, res);
                                                                                })
                                                                                .catch(err => {                                                                                    
                                                                                    res.status(500).json({
                                                                                        message: "Internal error occured while incrementing order_numbers"
                                                                                    });
                                                                                });
                                                                        })
                                                                        .catch(err => {
                                                                            res.status(500).json({
                                                                                message: "Internal error occured while getting updated listentry data"
                                                                            });
                                                                        });
                                                                })
                                                                .catch(err => {
                                                                    res.status(500).json({
                                                                        message: "Internal error occured while updating listentry"
                                                                    })
                                                                });
                                                        }
                                                    })
                                                    .catch(err => {
                                                        res.status(500).json({
                                                            message: "Internal error occured while getting upper Listentry"
                                                        })
                                                    });
                                            }
                                        // }
                                    // }
                                // })
                                // .catch(err => {
                                //     res.status(500).json({
                                //         message: "Internal error occured while fetching upperId"
                                //     });
                                // });
                        }
                    }
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Internal error occured while finding listentry by id"
                    });
                });
        });
    }
};

async function updateListId(list_id, id){
    await Listentry.update({ list_id: list_id }, { where: { id: id }});
}

function cleanOrderNumbers(oldListId, list_id, res){
    // foreach list make ordernumber ascending from 0 in steps of 1
    var lists = [];
    if (oldListId != list_id){
        lists.push(oldListId, list_id);
    } else {
        lists.push(list_id);
    }
    cleanOrderHelper(lists, res, response_data => {
        if (typeof response_data != Array){
            console.log(response_data);
            
            // res.status(500).json({
            //     message: "Internal error occured while cleaning order"
            // })
            console.log(1111111111111111);
            res.status(500).json(response_data)
            
        } else {
            res.status(200).json(response_data);
        }
    });
}

async function cleanOrderHelper(lists, res, callback){
    var response_data = [-1];
    var listId;
    for (var i = 0; i < lists.length; i++){
        listId = lists[i];
        Listentry.findAll({ where: { list_id: listId }})
                .then(async data => {
                    var newData = [];
                    var j = 0;
                    data.sort((a, b) => { return a.order_number - b.order_number });
                    data.forEach(listentry => {
                        listentry.order_number = j;
                        newData.push(listentry);
                        j++;
                    });
                    for (var k = 0; k < newData.length; k++){
                        await Listentry.update(newData[k], { where: { id: newData[k].id }})
                            .then(async data => {
                                response_data.push(data);
                                if ((i == lists.length - 1) && (k == newData.length -1)) {
                                    console.log("whyhyh");
                                    
                                   await callback(response_data);
                                }
                            })
                            .catch(async err => {
                                await callback(err);
                            });
                    }
                })
                .catch(async err => {
                    await callback(err);
                });
    };
}

function checkListPerm(req, res, next) {
    List.findByPk(req.userData.list_id)
        .then(data => {
            if (!data.board_id) {
                res.status(404).json({
                    message: `A list with the specified id "${req.body.list_id}" was not found`
                });
            } else {
                var board_id = data.board_id;
                Board.findByPk(board_id)
                    .then(board_data => {
                        if (!board_data) {
                            res.status(404).json({
                                message: `A board with specified ID: ${board_id} was not found`
                            });
                        } else if (board_data.owner_id != req.userData.userid){
                            Shared_Board.findAll({ where: { shared_user_id: req.userData.userid, board_id: board_id}})
                                .then(shared_board_data => {
                                    if (shared_board_data.length < 1) {
                                        res.status(401).json({
                                            message: "Auth failed"
                                        });
                                    } else {
                                        next();
                                    }
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        message: "Internal server error occured while checking shared_board data"
                                    });
                                });
                        } else {
                            next();
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "Internal server error occured while getting board information"
                        });
                    });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal error occured while getting list data"
            });
        });
}