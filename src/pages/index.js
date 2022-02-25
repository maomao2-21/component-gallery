// import React from 'react';
// import { Table } from 'antd';
// import { Resizable } from 'react-resizable';

// let timestamp=new Date().getTime();

// let ResizeableTitle = (props) => {
//     let leftWidth = $("#"+timestamp).width()-84;
//     let { onResize, width, ...restProps } = props;
//     if (!width) {
//         return <th {...restProps} />;
//     }
//     let str = 0;
//     let widthNum = 0;
//     if(isNaN(width)){
//         if(width.indexOf("%")>-1){
//             str=width.replace("%","");
//             str= str/100;
//             widthNum = leftWidth*str;
//         }else if(width.indexOf("px")>-1){
//             str=width.replace("px","");
//             str=str*1;
//             widthNum = str*1;
//         }else{
//             widthNum = width*1;
//         }
//     }else{
//         widthNum=150;
//     }
//     return (
//         <th className="resizable_th"> 
//             <Resizable width={widthNum} height={0} onResize={onResize}>
//                 <div {...restProps} />
//             </Resizable>
//         </th>
//     );
// };

// class MyTable extends React.Component {
//     state={
//         columns:this.props.columns==null?[]:this.props.columns.map(item=>{
//             if(!item.width && item.title!='操作'){
//                 item.width='10%';
//             }
//             return item;
//         }),
//         selectedRows:[],
//         selectedRowKeys: [],
//         expandedRows:[],
//         page:1,
//         pageSize:10
//     }

//     //父组件属性变化
//     componentWillReceiveProps(nextProps){
//       this.setState({
//         columns: nextProps.columns,
//       })
//     }
//     //列表拉伸所需属性
//     components = {
//         header: {
//             cell: ResizeableTitle,
//         },
//     };

//     handleResize = index => (e, { size }) => {
//         this.setState(({ columns }) => {
//             let nextColumns = [...columns];
//             nextColumns[index] = {
//                 ...nextColumns[index],
//                 width: size.width,
//             };
//             return { columns: nextColumns };
//         });
//     };

//      //列表点击行选中,多选
//      selectRow = (record) => {
//         let selectedRowKeys = [...this.state.selectedRowKeys];
//         let selectedRows = [...this.state.selectedRows];
//         if (selectedRowKeys.indexOf(record.id) >= 0) {
//             selectedRowKeys.splice(selectedRowKeys.indexOf(record.id), 1);
//         } else {
//             selectedRowKeys.push(record.id);
//         }
//         this.setState({ selectedRowKeys });
//         selectedRows.push(record);
//         let arr=[];
//         for(let i =0;i<selectedRowKeys.length;i++){
//             for(let j =0;j<selectedRows.length;j++){
//                 if(selectedRows[j].id==selectedRowKeys[i]){
//                     arr.push(selectedRows[j]);
//                 }
//             }
//         }
//         if(this.props.setRows){
//             if (this.props.isclick) {
//                 this.props.setRows(record,this.state.selectedRows,arr)
//             } else {
//                 this.props.setRows(this.state.selectedRows,arr);
//             }
//         }
//         this.setState({ "selectedRows":arr });
//     }

//     onSelectedRowKeysChange = (selectedRowKeys,selectedRows) => {
//         if(this.props.setRows){
//             this.props.setRows(this.state.selectedRows,selectedRows);
//         }
//         this.setState({ selectedRowKeys });
//         this.setState({ selectedRows });
//     }

//     setExpandedRowsChange=()=>{
//         let {expandedRows} = this.state;
//         const dataSource = this.props.dataSource==null?[]:this.props.dataSource;
//         let keys=[];
//         if(dataSource&&dataSource.length>0){
//             dataSource.map(item=>{
//                 if(item&&item.id){
//                     keys.push(item.id);
//                 }
//             })
//         }

//         if(expandedRows&&expandedRows.length>0){
//             this.setState({expandedRows:[]});
//         }else{
//             this.setState({expandedRows:keys});
//         }
//     }

//     onExpandedRowsChange=(expandedRows)=>{
//         this.setState({expandedRows});
//     }

//     onPaginationChange=(page, pageSize)=>{
//         console.info(pageSize)
//         this.setState({page:page,pageSize:pageSize});
//         this.state.page=page;
//         this.state.pageSize=pageSize;
//         if(this.props.getList){
//             this.props.getList();
//         }
//     }

//     showTotal=()=>{
//         return this.props.total?<span>共 {this.props.total} 条</span>:'';
//     }

//     render(){
//         let {selectedRowKeys,expandedRows} = this.state; 
//         let scroll = this.props.scroll?this.props.scroll:{};
//         let expandedRowRender = this.props.expandedRowRender?this.props.expandedRowRender:null;
//         let dataSource = [];
//         dataSource = this.props.dataSource?this.props.dataSource:[];
//         let columns = this.state.columns&&this.state.columns.map((col, index) => ({
//             ...col,
//             onHeaderCell: column => ({
//                 width: column.width,
//                 onResize: this.handleResize(index),
//             }),
//         }));

//         let rowSelection = {
//             columnWidth:45,
//             selectedRowKeys:selectedRowKeys,
//             onChange: this.onSelectedRowKeysChange,
//         };

//         let pagination = {
//             current:this.state.page,
//             pageSizeOptions:['5','10','15','20','30','50'],
//             defaultCurrent:this.state.page,
//             showSizeChanger: true,
//             showQuickJumper: true,
//             total:this.props.total?this.props.total:0,
//             onChange:this.onPaginationChange,
//             onShowSizeChange:this.onPaginationChange,
//             showTotal:this.showTotal,
//             defaultPageSize: this.state.pageSize,
//             pageSize:this.state.pageSize
//         };

//         return (
//                 <Table 
//                     id={timestamp+''}
//                     bordered
//                     rowKey={record => record.id?record.id:Math.random()}
//                     components={this.components}
//                     pagination={this.props.pagination==null?pagination:this.props.pagination}
//                     columns={columns}
//                     dataSource={dataSource}
//                     expandedRowKeys={expandedRows}
//                     defaultExpandedRowKeys={this.props.expandedRowKeys?this.props.expandedRowKeys:[]}
//                     expandedRowRender={expandedRowRender}
//                     onExpandedRowsChange={this.onExpandedRowsChange}
//                     rowSelection={this.props.rowSelection==false?null:rowSelection} 
//                     style={this.props.style==null?null:this.props.style}
//                     scroll={scroll}
//                     showHeader={this.props.showHeader==false?false:true} 
//                     onRow={this.props.onRow==null?
//                         (record) => ({
//                           onClick: () => {
//                               this.selectRow(record);
//                           },
//                       }) : this.props.onRow
//                     }
//                 />
//         );
//     }
// }

// export default MyTable;
import React from 'react';
import { Table } from 'antd';
import { Resizable } from 'react-resizable';

let timestamp = new Date().getTime();


const ResizeableTitle = props => {
    const { onResize, width, ...restProps } = props;
    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable
            width={width}
            height={0}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th {...restProps} />
        </Resizable>
    );
};

class MyTable extends React.Component {
    state = {
        columns: this.props.columns == null ? [] : this.props.columns.map(item => {
            // if (!item.width && item.title != '操作') {
            //   item.width = '10%';
            // }
            return item;
        }),
        selectedRows: [],
        selectedRowKeys: [],
        expandedRows: [],
        page: 1,
        pageSize: 10
    }

    //父组件属性变化
    componentWillReceiveProps (nextProps) {
        this.setState({
            columns: nextProps.columns,
        })
    }

    //列表拉伸所需属性
    components = {
        header: {
            cell: ResizeableTitle,
        },
    };

    handleResize = index => (e, { size }) => {
        this.setState(({ columns }) => {
            let nextColumns = [...columns];
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width,
            };
            return { columns: nextColumns };
        });
    };

    //列表点击行选中,多选
    selectRow = (record) => {
        let selectedRowKeys = [...this.state.selectedRowKeys];
        let selectedRows = [...this.state.selectedRows];
        if (selectedRowKeys.indexOf(record.id) >= 0) {
            selectedRowKeys.splice(selectedRowKeys.indexOf(record.id), 1);
        } else {
            selectedRowKeys.push(record.id);
        }
        this.setState({ selectedRowKeys });
        selectedRows.push(record);
        let arr = [];
        for (let i = 0; i < selectedRowKeys.length; i++) {
            for (let j = 0; j < selectedRows.length; j++) {
                if (selectedRows[j].id == selectedRowKeys[i]) {
                    arr.push(selectedRows[j]);
                }
            }
        }
        if (this.props.setRows) {
            this.props.setRows(this.state.selectedRows, arr);
        }

        this.setState({ 'selectedRows': arr });
    }

    onSelectedRowKeysChange = (selectedRowKeys, selectedRows) => {
        if (this.props.setRows) {
            this.props.setRows(this.state.selectedRows, selectedRows);
        }

        // this.props.rowSelectionback(
        //   selectedRowKeys.sort(function(a,b){return a-b})
        // )
        this.setState({ selectedRowKeys });
        this.setState({ selectedRows });
    }

    setExpandedRowsChange = () => {
        let { expandedRows } = this.state;
        const dataSource = this.props.dataSource == null ? [] : this.props.dataSource;
        let keys = [];
        if (dataSource && dataSource.length > 0) {
            dataSource.map(item => {
                if (item && item.id) {
                    keys.push(item.id);
                }
            })
        }

        if (expandedRows && expandedRows.length > 0) {
            this.setState({ expandedRows: [] });
        } else {
            this.setState({ expandedRows: keys });
        }
    }

    onExpandedRowsChange = (expandedRows) => {
        this.setState({ expandedRows });
    }

    onPaginationChange = (page, pageSize) => {
        let rowSelection = {
            columnWidth: 45,
            selectedRowKeys: selectedRowKeys,

            onChange: this.onSelectedRowKeysChange,
            type: this.props.rowSelectiontype ? 'radio' : 'checkbox '
        };
        // console.info(pageSize)
        this.setState({ page: page, pageSize: pageSize });
        this.state.page = page;
        this.state.pageSize = pageSize;
        if (this.props.getList) {
            this.props.getList();
        }
    }

    showTotal = () => {
        return this.props.total ? <span>共 {this.props.total} 条</span> : '';
    }

    render () {
        let { selectedRowKeys, expandedRows } = this.state;
        let scroll = this.props.scroll ? this.props.scroll : {};
        let expandedRowRender = this.props.expandedRowRender ? this.props.expandedRowRender : null;
        let dataSource = [];
        dataSource = this.props.dataSource ? this.props.dataSource : [];
        let columns = this.state.columns.map((col, index) => ({
            ...col,
            onHeaderCell: column => ({
                width: column.width,
                onResize: this.handleResize(index),
            }),
        }));

        let rowSelection = {
            columnWidth: 45,
            selectedRowKeys: selectedRowKeys,

            onChange: this.onSelectedRowKeysChange,
            type: this.props.rowSelectiontype ? 'radio' : 'checkbox '
        };

        let pagination = {
            current: this.state.page,
            pageSizeOptions: this.props.pageSizeOptions ? this.props.pageSizeOptions : ['2', '5', '10', '15', '20', '30', '50', '100'],
            defaultCurrent: this.state.page,
            showSizeChanger: true,
            showQuickJumper: true,
            total: this.props.total ? this.props.total : 0,
            onChange: this.onPaginationChange,
            onShowSizeChange: this.onPaginationChange,
            showTotal: this.showTotal,
            defaultPageSize: this.props.defaultPageSize ? this.props.defaultPageSize : this.state.pageSize,
            pageSize: this.props.pageSize ? this.props.pageSize : this.state.pageSize
        };


        return (
            <Table
                id={timestamp + ''}
                bordered
                // rowKey={record => {
                //   // console.log(record,'rrrrrr')
                //   record.id ? record.id :record.executionId?record.executionId: Math.random()}}
                rowKey={record => {
                    if (this.props.rowKey) {
                        return record[this.props.rowKey]
                    }
                    return record.id ? record.id : record.executionId ? record.executionId : Math.random()
                }
                    // console.log(record,'rrrrrr')
                }

                components={this.components}
                pagination={this.props.pagination == null ? pagination : this.props.pagination}
                columns={columns}
                dataSource={dataSource}
                expandedRowKeys={expandedRows}
                defaultExpandedRowKeys={this.props.expandedRowKeys ? this.props.expandedRowKeys : []}
                expandedRowRender={expandedRowRender}
                onExpandedRowsChange={this.onExpandedRowsChange}
                rowSelection={this.props.rowSelection == false ? null : rowSelection}
                style={this.props.style == null ? null : this.props.style}
                scroll={scroll}
                showHeader={this.props.showHeader == false ? false : true}
                onRow={this.props.onRow == null ?
                    (record) => ({
                        onClick: () => {
                            this.selectRow(record);
                        },
                    }) : this.props.onRow
                }
            />
        );
    }
}

export default MyTable;
