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
                    var order_number = 0;
                    if (data.length >= 1){
                        var arrOrdNmbrs = data.map(a => a.order_number);
                        order_number = Math.max(...arrOrdNmbrs) + 1;
                    }
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

exports.delete = (req, res) => {
    const id = req.params.id;
    if (!id){
        res.status(400).json({
            message: "id cannot be empty"
        });
    } else {
        Listentry.findByPk(id)
            .then(data => {
                if (!data.list_id){
                    res.status(404).json({
                        message: "A listentry with the specified id does not exist"
                    });
                } else {
                    req.userData.list_id = data.list_id;
                    checkListPerm(req, res, () => {
                        Listentry.destroy({ where: { id: id }})
                            .then(num => {
                                if (num == 1){
                                    res.status(200).json({
                                        message: "Listentry was deleted successfully"
                                    });
                                } else {
                                    res.status(404).json({
                                        message: "A listentry with the specified id does not exist"
                                    });
                                }
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: "Internal error occured while deleting listentry"
                                });
                            });
                    });
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal error occured while fetching listentry"
                });
            });
    }
};

// Retrieve a single listentry by id
exports.findOne = (req, res) => {
    Listentry.findByPk(req.params.id)
        .then(data => {
            if (data.id){
                req.userData.list_id = data.list_id;                                
                checkListPerm(req, res, () => {
                    res.status(200).json(data);
                });
            } else {
                res.status(404).json({
                    message: `A listentry with the specified id ${req.params.id} was not found`
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal error occured while getting the listentry"
            });
        });
};

// Change title and/or description and/or due_date
exports.update = (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const due_date = (req.body.due_date == "") ? null : new Date(req.body.due_date);
    const id = req.params.id;
    if ((title == null) && (description == null) && (due_date == null)){
        res.status(400).json({
            message: "At least one of Title, description or due_date should be defined"
        });
    } else if (title != null && !title.trim()){
        res.status(400).json({
            message: "Title cannot be empty"
        });
    } else if (due_date != null && due_date == "Invalid Date"){
        res.status(400).json({
            message: "The given due_date has an invalid format"
        });
    } else {
        Listentry.findByPk(id)
            .then(data => {
                if (!data.list_id){
                    res.status(404).json({
                        message: "A listentry with the specified id was not found"
                    });
                } else {                    
                    req.userData.list_id = data.list_id;
                    checkListPerm(req, res, () => {
                        const listentry = {};
                        if (title){
                            listentry.title = title;
                        }
                        if (description != null){
                            listentry.description = description;
                        }
                        listentry.due_date = due_date;
                        Listentry.update(listentry, { where: { id: id }})
                            .then(num => {
                                if (num != 1) {
                                    res.status(404).json({
                                        message: "A listentry with the specified id was not found"
                                    });
                                } else {
                                    res.status(200).json({
                                        message: "Listentry was updated successfully"
                                    });
                                }
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: "Internal error occured while updating the listentry"
                                });
                            });
                    });
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal error occured while checking listentry"
                });
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
                                                        Listentry.findByPk(id)
                                                            .then(data => {
                                                                var oldListId = data.list_id;
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
                                                                    message: "Internal error occured while getting listentry"
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
    var response_data = recFind(lists);
    if (response_data == -1){
        res.status(500).json({
            message: "Internal error occured while cleaning OrderNumbers"
        });
    } else {
        res.status(200).json(response_data);
    }
}

function recFind(lists){
    var response_data;
    var listId = lists[0];
    Listentry.findAll({ where: { list_id: listId }})
        .then(data => {
            var newData = [];
            var i = 0;
            data.sort((a, b) => { return a.order_number - b.order_number });
            data.forEach(listentry => {
                listentry.order_number = i;
                newData.push(listentry);
                i++;
            });
            response_data.push(recUpdate(newData));
            if (response_data == -1){
                return -1;
            } else {
                if (lists.length == 1){
                    return response_data;
                } else {
                    lists.shift();
                    response_data.push(recFind(lists));
                    if (response_data[response_data.length - 1] == -1){
                        return -1;
                    } else {
                        return response_data;
                    }
                }
            }
        })
        .catch(err => {
            return -1;
        });
}

function recUpdate(newData) {
    var response = [];
    var dataSet = newData[0];
    Listentry.update(dataSet, { where: { id: dataSet.id }})
        .then(data => {
            if (newData.length > 1){
                newData.shift();
                response.push(data, recUpdate(newData));
                if (response[response.length - 1] == -1){
                    return -1;
                } else {
                    return response;
                }
            } else {
                response.push(data);
                return(response);
            }
        })
        .catch(err => {
            return -1;
        });
}

function checkListPerm(req, res, next) {
    List.findByPk(req.userData.list_id)
        .then(data => {
            if (!data.board_id) {
                res.status(404).json({
                    message: `A list with the specified id "${req.userData.list_id}" was not found`
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