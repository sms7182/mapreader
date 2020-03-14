import { Component, OnInit,  Injectable } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';

import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject} from 'rxjs';
import { TodoItemFlatNode } from '../models/TodoItemFlatNode';
import { TodoItemNode } from '../models/TodoItemNode';
import Map from 'ol/Map';
import View from 'ol/View';
import WKT from 'ol/format/WKT';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';

let TREE_DATA = []
 

@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] { return this.dataChange.value; }

  constructor() {
    this.initialize();
  }


  initialize() {
 
    const data = this.buildFileTree(TREE_DATA, 0);

    this.dataChange.next(data);
  }
  changeData(){
   const data= this.buildFileTree(TREE_DATA,0)
   this.dataChange.next(data)
  }
  buildFileTree(obj: {[key: string]: any}, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({item: name} as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}
@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css'], providers: [ChecklistDatabase]
})
export class FolderComponent implements OnInit {

  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  selectedParent: TodoItemFlatNode | null = null;

  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
  canDropFolder = typeof DataTransferItem.prototype.webkitGetAsEntry === 'function';
  uploadPaths = [];
  
  ngOnInit() {
  }

  tree:TodoItemNode;
  fileContent:string=''
  allfile:File[];
  selectfolder(files){
   
   this.allfile=files;
     this.tree=new TodoItemNode()
    for(var i=0;i<files.length;i++){
   
    
      var path=files[i].webkitRelativePath.split('/');
      if(this.tree.item!==path[0]){
        this.tree.item=path[0]
      }
      var temp=this.tree;
      for(var j=1;j<path.length;j++){
       temp= this.populateTree(path[j],temp);
      }
     // temp.file=files[i];
      
    }
   
    var tempTree:TodoItemNode[]=[];
   tempTree.push(this.tree)
    TREE_DATA=tempTree;
    this.dbsource.changeData();
  
  }
  populateTree(path:string,child:TodoItemNode){

    if(child.children===undefined){
      child.children=[]
    }
    if(child.children!==undefined){
    var founded=  child.children.find(({item})=>item===path);
    if(founded!==null&&founded!==undefined){
      return founded;
    }
    else{
      var node= new TodoItemNode();
      node.item=path;
      
      child.children.push(node)
      return node;
    }
  }
  else{
     var node= new TodoItemNode();
     node.item=path;
     child.children.push(node)
     return node;
    }
  }
  
   dbsource:ChecklistDatabase;
  constructor(private _database: ChecklistDatabase) {
    this.dbsource=_database;
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
   
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
   if(this.checklistSelection.isSelected(node)){
    let polygon:string|ArrayBuffer;
    let fileReader = new FileReader();
    
    var raster = new TileLayer({
      source: new OSM()
    });
    debugger;
   var filet= this.allfile.find(({name})=>{name===node.item});
   console.log(filet)
     var rs=fileReader.readAsText(filet)
     fileReader.onload = (e) => {
      console.log(fileReader.result);
      //polygon=fileReader.result;
       var wkt=  fileReader.result
       var format=new WKT();
       var feature=format.readFeature(wkt,{
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
       })
       
    var vector = new VectorLayer({
    source: new VectorSource({
     features: [feature]
    })
    });

    

var map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [2952104.0199, -3277504.823],
    zoom: 4
  })
});
     }
   }
  
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }

  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this._database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }


  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this._database.updateItem(nestedNode!, itemValue);
  }
  
  
}
