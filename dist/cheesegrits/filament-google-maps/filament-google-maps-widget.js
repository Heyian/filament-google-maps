var __create=Object.create,__defProp=Object.defineProperty,__getProtoOf=Object.getPrototypeOf,__hasOwnProp=Object.prototype.hasOwnProperty,__getOwnPropNames=Object.getOwnPropertyNames,__getOwnPropDesc=Object.getOwnPropertyDescriptor;var __markAsModule=target=>__defProp(target,"__esModule",{value:!0});var __commonJS=(callback,module)=>()=>(module||(module={exports:{}},callback(module.exports,module)),module.exports);var __exportStar=(target,module,desc)=>{if(module&&typeof module=="object"||typeof module=="function")for(let key of __getOwnPropNames(module))!__hasOwnProp.call(target,key)&&key!=="default"&&__defProp(target,key,{get:()=>module[key],enumerable:!(desc=__getOwnPropDesc(module,key))||desc.enumerable});return target},__toModule=module=>__exportStar(__markAsModule(__defProp(module!=null?__create(__getProtoOf(module)):{},"default",module&&module.__esModule&&"default"in module?{get:()=>module.default,enumerable:!0}:{value:module,enumerable:!0})),module);var require_fast_deep_equal=__commonJS((exports,module)=>{"use strict";module.exports=function equal2(a,b){if(a===b)return!0;if(a&&b&&typeof a=="object"&&typeof b=="object"){if(a.constructor!==b.constructor)return!1;var length,i,keys;if(Array.isArray(a)){if(length=a.length,length!=b.length)return!1;for(i=length;i--!=0;)if(!equal2(a[i],b[i]))return!1;return!0}if(a.constructor===RegExp)return a.source===b.source&&a.flags===b.flags;if(a.valueOf!==Object.prototype.valueOf)return a.valueOf()===b.valueOf();if(a.toString!==Object.prototype.toString)return a.toString()===b.toString();if(keys=Object.keys(a),length=keys.length,length!==Object.keys(b).length)return!1;for(i=length;i--!=0;)if(!Object.prototype.hasOwnProperty.call(b,keys[i]))return!1;for(i=length;i--!=0;){var key=keys[i];if(!equal2(a[key],b[key]))return!1}return!0}return a!==a&&b!==b}});var import_fast_deep_equal=__toModule(require_fast_deep_equal());var ARRAY_TYPES=[Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],VERSION=1,HEADER_SIZE=8,KDBush=class{static from(data){if(!(data instanceof ArrayBuffer))throw new Error("Data must be an instance of ArrayBuffer.");let[magic,versionAndType]=new Uint8Array(data,0,2);if(magic!==219)throw new Error("Data does not appear to be in a KDBush format.");let version=versionAndType>>4;if(version!==VERSION)throw new Error(`Got v${version} data when expected v${VERSION}.`);let ArrayType=ARRAY_TYPES[versionAndType&15];if(!ArrayType)throw new Error("Unrecognized array type.");let[nodeSize]=new Uint16Array(data,2,1),[numItems]=new Uint32Array(data,4,1);return new KDBush(numItems,nodeSize,ArrayType,data)}constructor(numItems,nodeSize=64,ArrayType=Float64Array,data){if(isNaN(numItems)||numItems<0)throw new Error(`Unpexpected numItems value: ${numItems}.`);this.numItems=+numItems,this.nodeSize=Math.min(Math.max(+nodeSize,2),65535),this.ArrayType=ArrayType,this.IndexArrayType=numItems<65536?Uint16Array:Uint32Array;let arrayTypeIndex=ARRAY_TYPES.indexOf(this.ArrayType),coordsByteSize=numItems*2*this.ArrayType.BYTES_PER_ELEMENT,idsByteSize=numItems*this.IndexArrayType.BYTES_PER_ELEMENT,padCoords=(8-idsByteSize%8)%8;if(arrayTypeIndex<0)throw new Error(`Unexpected typed array class: ${ArrayType}.`);data&&data instanceof ArrayBuffer?(this.data=data,this.ids=new this.IndexArrayType(this.data,HEADER_SIZE,numItems),this.coords=new this.ArrayType(this.data,HEADER_SIZE+idsByteSize+padCoords,numItems*2),this._pos=numItems*2,this._finished=!0):(this.data=new ArrayBuffer(HEADER_SIZE+coordsByteSize+idsByteSize+padCoords),this.ids=new this.IndexArrayType(this.data,HEADER_SIZE,numItems),this.coords=new this.ArrayType(this.data,HEADER_SIZE+idsByteSize+padCoords,numItems*2),this._pos=0,this._finished=!1,new Uint8Array(this.data,0,2).set([219,(VERSION<<4)+arrayTypeIndex]),new Uint16Array(this.data,2,1)[0]=nodeSize,new Uint32Array(this.data,4,1)[0]=numItems)}add(x,y){let index=this._pos>>1;return this.ids[index]=index,this.coords[this._pos++]=x,this.coords[this._pos++]=y,index}finish(){let numAdded=this._pos>>1;if(numAdded!==this.numItems)throw new Error(`Added ${numAdded} items when expected ${this.numItems}.`);return sort(this.ids,this.coords,this.nodeSize,0,this.numItems-1,0),this._finished=!0,this}range(minX,minY,maxX,maxY){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");let{ids,coords,nodeSize}=this,stack=[0,ids.length-1,0],result=[];for(;stack.length;){let axis=stack.pop()||0,right=stack.pop()||0,left=stack.pop()||0;if(right-left<=nodeSize){for(let i=left;i<=right;i++){let x2=coords[2*i],y2=coords[2*i+1];x2>=minX&&x2<=maxX&&y2>=minY&&y2<=maxY&&result.push(ids[i])}continue}let m=left+right>>1,x=coords[2*m],y=coords[2*m+1];x>=minX&&x<=maxX&&y>=minY&&y<=maxY&&result.push(ids[m]),(axis===0?minX<=x:minY<=y)&&(stack.push(left),stack.push(m-1),stack.push(1-axis)),(axis===0?maxX>=x:maxY>=y)&&(stack.push(m+1),stack.push(right),stack.push(1-axis))}return result}within(qx,qy,r){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");let{ids,coords,nodeSize}=this,stack=[0,ids.length-1,0],result=[],r2=r*r;for(;stack.length;){let axis=stack.pop()||0,right=stack.pop()||0,left=stack.pop()||0;if(right-left<=nodeSize){for(let i=left;i<=right;i++)sqDist(coords[2*i],coords[2*i+1],qx,qy)<=r2&&result.push(ids[i]);continue}let m=left+right>>1,x=coords[2*m],y=coords[2*m+1];sqDist(x,y,qx,qy)<=r2&&result.push(ids[m]),(axis===0?qx-r<=x:qy-r<=y)&&(stack.push(left),stack.push(m-1),stack.push(1-axis)),(axis===0?qx+r>=x:qy+r>=y)&&(stack.push(m+1),stack.push(right),stack.push(1-axis))}return result}},kdbush_default=KDBush;function sort(ids,coords,nodeSize,left,right,axis){if(right-left<=nodeSize)return;let m=left+right>>1;select(ids,coords,m,left,right,axis),sort(ids,coords,nodeSize,left,m-1,1-axis),sort(ids,coords,nodeSize,m+1,right,1-axis)}function select(ids,coords,k,left,right,axis){for(;right>left;){if(right-left>600){let n=right-left+1,m=k-left+1,z=Math.log(n),s=.5*Math.exp(2*z/3),sd=.5*Math.sqrt(z*s*(n-s)/n)*(m-n/2<0?-1:1),newLeft=Math.max(left,Math.floor(k-m*s/n+sd)),newRight=Math.min(right,Math.floor(k+(n-m)*s/n+sd));select(ids,coords,k,newLeft,newRight,axis)}let t=coords[2*k+axis],i=left,j=right;for(swapItem(ids,coords,left,k),coords[2*right+axis]>t&&swapItem(ids,coords,left,right);i<j;){for(swapItem(ids,coords,i,j),i++,j--;coords[2*i+axis]<t;)i++;for(;coords[2*j+axis]>t;)j--}coords[2*left+axis]===t?swapItem(ids,coords,left,j):(j++,swapItem(ids,coords,j,right)),j<=k&&(left=j+1),k<=j&&(right=j-1)}}function swapItem(ids,coords,i,j){swap(ids,i,j),swap(coords,2*i,2*j),swap(coords,2*i+1,2*j+1)}function swap(arr,i,j){let tmp=arr[i];arr[i]=arr[j],arr[j]=tmp}function sqDist(ax,ay,bx,by){let dx=ax-bx,dy=ay-by;return dx*dx+dy*dy}var defaultOptions={minZoom:0,maxZoom:16,minPoints:2,radius:40,extent:512,nodeSize:64,log:!1,generateId:!1,reduce:null,map:props=>props},fround=Math.fround||(tmp=>x=>(tmp[0]=+x,tmp[0]))(new Float32Array(1)),OFFSET_ZOOM=2,OFFSET_ID=3,OFFSET_PARENT=4,OFFSET_NUM=5,OFFSET_PROP=6,Supercluster=class{constructor(options){this.options=Object.assign(Object.create(defaultOptions),options),this.trees=new Array(this.options.maxZoom+1),this.stride=this.options.reduce?7:6,this.clusterProps=[]}load(points){let{log,minZoom,maxZoom}=this.options;log&&console.time("total time");let timerId=`prepare ${points.length} points`;log&&console.time(timerId),this.points=points;let data=[];for(let i=0;i<points.length;i++){let p=points[i];if(!p.geometry)continue;let[lng,lat]=p.geometry.coordinates,x=fround(lngX(lng)),y=fround(latY(lat));data.push(x,y,Infinity,i,-1,1),this.options.reduce&&data.push(0)}let tree=this.trees[maxZoom+1]=this._createTree(data);log&&console.timeEnd(timerId);for(let z=maxZoom;z>=minZoom;z--){let now=+Date.now();tree=this.trees[z]=this._createTree(this._cluster(tree,z)),log&&console.log("z%d: %d clusters in %dms",z,tree.numItems,+Date.now()-now)}return log&&console.timeEnd("total time"),this}getClusters(bbox,zoom){let minLng=((bbox[0]+180)%360+360)%360-180,minLat=Math.max(-90,Math.min(90,bbox[1])),maxLng=bbox[2]===180?180:((bbox[2]+180)%360+360)%360-180,maxLat=Math.max(-90,Math.min(90,bbox[3]));if(bbox[2]-bbox[0]>=360)minLng=-180,maxLng=180;else if(minLng>maxLng){let easternHem=this.getClusters([minLng,minLat,180,maxLat],zoom),westernHem=this.getClusters([-180,minLat,maxLng,maxLat],zoom);return easternHem.concat(westernHem)}let tree=this.trees[this._limitZoom(zoom)],ids=tree.range(lngX(minLng),latY(maxLat),lngX(maxLng),latY(minLat)),data=tree.data,clusters=[];for(let id of ids){let k=this.stride*id;clusters.push(data[k+OFFSET_NUM]>1?getClusterJSON(data,k,this.clusterProps):this.points[data[k+OFFSET_ID]])}return clusters}getChildren(clusterId){let originId=this._getOriginId(clusterId),originZoom=this._getOriginZoom(clusterId),errorMsg="No cluster with the specified id.",tree=this.trees[originZoom];if(!tree)throw new Error(errorMsg);let data=tree.data;if(originId*this.stride>=data.length)throw new Error(errorMsg);let r=this.options.radius/(this.options.extent*Math.pow(2,originZoom-1)),x=data[originId*this.stride],y=data[originId*this.stride+1],ids=tree.within(x,y,r),children=[];for(let id of ids){let k=id*this.stride;data[k+OFFSET_PARENT]===clusterId&&children.push(data[k+OFFSET_NUM]>1?getClusterJSON(data,k,this.clusterProps):this.points[data[k+OFFSET_ID]])}if(children.length===0)throw new Error(errorMsg);return children}getLeaves(clusterId,limit,offset){limit=limit||10,offset=offset||0;let leaves=[];return this._appendLeaves(leaves,clusterId,limit,offset,0),leaves}getTile(z,x,y){let tree=this.trees[this._limitZoom(z)],z2=Math.pow(2,z),{extent,radius}=this.options,p=radius/extent,top=(y-p)/z2,bottom=(y+1+p)/z2,tile={features:[]};return this._addTileFeatures(tree.range((x-p)/z2,top,(x+1+p)/z2,bottom),tree.data,x,y,z2,tile),x===0&&this._addTileFeatures(tree.range(1-p/z2,top,1,bottom),tree.data,z2,y,z2,tile),x===z2-1&&this._addTileFeatures(tree.range(0,top,p/z2,bottom),tree.data,-1,y,z2,tile),tile.features.length?tile:null}getClusterExpansionZoom(clusterId){let expansionZoom=this._getOriginZoom(clusterId)-1;for(;expansionZoom<=this.options.maxZoom;){let children=this.getChildren(clusterId);if(expansionZoom++,children.length!==1)break;clusterId=children[0].properties.cluster_id}return expansionZoom}_appendLeaves(result,clusterId,limit,offset,skipped){let children=this.getChildren(clusterId);for(let child of children){let props=child.properties;if(props&&props.cluster?skipped+props.point_count<=offset?skipped+=props.point_count:skipped=this._appendLeaves(result,props.cluster_id,limit,offset,skipped):skipped<offset?skipped++:result.push(child),result.length===limit)break}return skipped}_createTree(data){let tree=new kdbush_default(data.length/this.stride|0,this.options.nodeSize,Float32Array);for(let i=0;i<data.length;i+=this.stride)tree.add(data[i],data[i+1]);return tree.finish(),tree.data=data,tree}_addTileFeatures(ids,data,x,y,z2,tile){for(let i of ids){let k=i*this.stride,isCluster=data[k+OFFSET_NUM]>1,tags,px,py;if(isCluster)tags=getClusterProperties(data,k,this.clusterProps),px=data[k],py=data[k+1];else{let p=this.points[data[k+OFFSET_ID]];tags=p.properties;let[lng,lat]=p.geometry.coordinates;px=lngX(lng),py=latY(lat)}let f={type:1,geometry:[[Math.round(this.options.extent*(px*z2-x)),Math.round(this.options.extent*(py*z2-y))]],tags},id;isCluster||this.options.generateId?id=data[k+OFFSET_ID]:id=this.points[data[k+OFFSET_ID]].id,id!==void 0&&(f.id=id),tile.features.push(f)}}_limitZoom(z){return Math.max(this.options.minZoom,Math.min(Math.floor(+z),this.options.maxZoom+1))}_cluster(tree,zoom){let{radius,extent,reduce,minPoints}=this.options,r=radius/(extent*Math.pow(2,zoom)),data=tree.data,nextData=[],stride=this.stride;for(let i=0;i<data.length;i+=stride){if(data[i+OFFSET_ZOOM]<=zoom)continue;data[i+OFFSET_ZOOM]=zoom;let x=data[i],y=data[i+1],neighborIds=tree.within(data[i],data[i+1],r),numPointsOrigin=data[i+OFFSET_NUM],numPoints=numPointsOrigin;for(let neighborId of neighborIds){let k=neighborId*stride;data[k+OFFSET_ZOOM]>zoom&&(numPoints+=data[k+OFFSET_NUM])}if(numPoints>numPointsOrigin&&numPoints>=minPoints){let wx=x*numPointsOrigin,wy=y*numPointsOrigin,clusterProperties,clusterPropIndex=-1,id=((i/stride|0)<<5)+(zoom+1)+this.points.length;for(let neighborId of neighborIds){let k=neighborId*stride;if(data[k+OFFSET_ZOOM]<=zoom)continue;data[k+OFFSET_ZOOM]=zoom;let numPoints2=data[k+OFFSET_NUM];wx+=data[k]*numPoints2,wy+=data[k+1]*numPoints2,data[k+OFFSET_PARENT]=id,reduce&&(clusterProperties||(clusterProperties=this._map(data,i,!0),clusterPropIndex=this.clusterProps.length,this.clusterProps.push(clusterProperties)),reduce(clusterProperties,this._map(data,k)))}data[i+OFFSET_PARENT]=id,nextData.push(wx/numPoints,wy/numPoints,Infinity,id,-1,numPoints),reduce&&nextData.push(clusterPropIndex)}else{for(let j=0;j<stride;j++)nextData.push(data[i+j]);if(numPoints>1)for(let neighborId of neighborIds){let k=neighborId*stride;if(!(data[k+OFFSET_ZOOM]<=zoom)){data[k+OFFSET_ZOOM]=zoom;for(let j=0;j<stride;j++)nextData.push(data[k+j])}}}}return nextData}_getOriginId(clusterId){return clusterId-this.points.length>>5}_getOriginZoom(clusterId){return(clusterId-this.points.length)%32}_map(data,i,clone){if(data[i+OFFSET_NUM]>1){let props=this.clusterProps[data[i+OFFSET_PROP]];return clone?Object.assign({},props):props}let original=this.points[data[i+OFFSET_ID]].properties,result=this.options.map(original);return clone&&result===original?Object.assign({},result):result}},supercluster_default=Supercluster;function getClusterJSON(data,i,clusterProps){return{type:"Feature",id:data[i+OFFSET_ID],properties:getClusterProperties(data,i,clusterProps),geometry:{type:"Point",coordinates:[xLng(data[i]),yLat(data[i+1])]}}}function getClusterProperties(data,i,clusterProps){let count=data[i+OFFSET_NUM],abbrev=count>=1e4?`${Math.round(count/1e3)}k`:count>=1e3?`${Math.round(count/100)/10}k`:count,propIndex=data[i+OFFSET_PROP],properties=propIndex===-1?{}:Object.assign({},clusterProps[propIndex]);return Object.assign(properties,{cluster:!0,cluster_id:data[i+OFFSET_ID],point_count:count,point_count_abbreviated:abbrev})}function lngX(lng){return lng/360+.5}function latY(lat){let sin=Math.sin(lat*Math.PI/180),y=.5-.25*Math.log((1+sin)/(1-sin))/Math.PI;return y<0?0:y>1?1:y}function xLng(x){return(x-.5)*360}function yLat(y){let y2=(180-y*360)*Math.PI/180;return 360*Math.atan(Math.exp(y2))/Math.PI-90}function __rest(s,e){var t={};for(var p in s)Object.prototype.hasOwnProperty.call(s,p)&&e.indexOf(p)<0&&(t[p]=s[p]);if(s!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,p=Object.getOwnPropertySymbols(s);i<p.length;i++)e.indexOf(p[i])<0&&Object.prototype.propertyIsEnumerable.call(s,p[i])&&(t[p[i]]=s[p[i]]);return t}var MarkerUtils=class{static isAdvancedMarkerAvailable(map){return google.maps.marker&&map.getMapCapabilities().isAdvancedMarkersAvailable===!0}static isAdvancedMarker(marker){return google.maps.marker&&marker instanceof google.maps.marker.AdvancedMarkerElement}static setMap(marker,map){this.isAdvancedMarker(marker)?marker.map=map:marker.setMap(map)}static getPosition(marker){if(this.isAdvancedMarker(marker)){if(marker.position){if(marker.position instanceof google.maps.LatLng)return marker.position;if(marker.position.lat&&marker.position.lng)return new google.maps.LatLng(marker.position.lat,marker.position.lng)}return new google.maps.LatLng(null)}return marker.getPosition()}static getVisible(marker){return this.isAdvancedMarker(marker)?!0:marker.getVisible()}},Cluster=class{constructor({markers,position}){this.markers=markers,position&&(position instanceof google.maps.LatLng?this._position=position:this._position=new google.maps.LatLng(position))}get bounds(){if(this.markers.length===0&&!this._position)return;let bounds=new google.maps.LatLngBounds(this._position,this._position);for(let marker of this.markers)bounds.extend(MarkerUtils.getPosition(marker));return bounds}get position(){return this._position||this.bounds.getCenter()}get count(){return this.markers.filter(m=>MarkerUtils.getVisible(m)).length}push(marker){this.markers.push(marker)}delete(){this.marker&&(MarkerUtils.setMap(this.marker,null),this.marker=void 0),this.markers.length=0}};var AbstractAlgorithm=class{constructor({maxZoom=16}){this.maxZoom=maxZoom}noop({markers}){return noop(markers)}};var noop=markers=>markers.map(marker=>new Cluster({position:MarkerUtils.getPosition(marker),markers:[marker]}));var SuperClusterAlgorithm=class extends AbstractAlgorithm{constructor(_a){var{maxZoom,radius=60}=_a,options=__rest(_a,["maxZoom","radius"]);super({maxZoom});this.state={zoom:-1},this.superCluster=new supercluster_default(Object.assign({maxZoom:this.maxZoom,radius},options))}calculate(input){let changed=!1,state={zoom:input.map.getZoom()};if(!(0,import_fast_deep_equal.default)(input.markers,this.markers)){changed=!0,this.markers=[...input.markers];let points=this.markers.map(marker=>{let position=MarkerUtils.getPosition(marker),coordinates=[position.lng(),position.lat()];return{type:"Feature",geometry:{type:"Point",coordinates},properties:{marker}}});this.superCluster.load(points)}return changed||(this.state.zoom<=this.maxZoom||state.zoom<=this.maxZoom)&&(changed=!(0,import_fast_deep_equal.default)(this.state,state)),this.state=state,changed&&(this.clusters=this.cluster(input)),{clusters:this.clusters,changed}}cluster({map}){return this.superCluster.getClusters([-180,-90,180,90],Math.round(map.getZoom())).map(feature=>this.transformCluster(feature))}transformCluster({geometry:{coordinates:[lng,lat]},properties}){if(properties.cluster)return new Cluster({markers:this.superCluster.getLeaves(properties.cluster_id,Infinity).map(leaf=>leaf.properties.marker),position:{lat,lng}});let marker=properties.marker;return new Cluster({markers:[marker],position:MarkerUtils.getPosition(marker)})}};var ClusterStats=class{constructor(markers,clusters){this.markers={sum:markers.length};let clusterMarkerCounts=clusters.map(a=>a.count),clusterMarkerSum=clusterMarkerCounts.reduce((a,b)=>a+b,0);this.clusters={count:clusters.length,markers:{mean:clusterMarkerSum/clusters.length,sum:clusterMarkerSum,min:Math.min(...clusterMarkerCounts),max:Math.max(...clusterMarkerCounts)}}}},DefaultRenderer=class{render({count,position},stats,map){let svg=`<svg fill="${count>Math.max(10,stats.clusters.markers.mean)?"#ff0000":"#0000ff"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="50" height="50">
<circle cx="120" cy="120" opacity=".6" r="70" />
<circle cx="120" cy="120" opacity=".3" r="90" />
<circle cx="120" cy="120" opacity=".2" r="110" />
<text x="50%" y="50%" style="fill:#fff" text-anchor="middle" font-size="50" dominant-baseline="middle" font-family="roboto,arial,sans-serif">${count}</text>
</svg>`,title=`Cluster of ${count} markers`,zIndex=Number(google.maps.Marker.MAX_ZINDEX)+count;if(MarkerUtils.isAdvancedMarkerAvailable(map)){let svgEl=new DOMParser().parseFromString(svg,"image/svg+xml").documentElement;svgEl.setAttribute("transform","translate(0 25)");let clusterOptions2={map,position,zIndex,title,content:svgEl};return new google.maps.marker.AdvancedMarkerElement(clusterOptions2)}let clusterOptions={position,zIndex,title,icon:{url:`data:image/svg+xml;base64,${btoa(svg)}`,anchor:new google.maps.Point(25,25)}};return new google.maps.Marker(clusterOptions)}};function extend(type1,type2){for(let property in type2.prototype)type1.prototype[property]=type2.prototype[property]}var OverlayViewSafe=class{constructor(){extend(OverlayViewSafe,google.maps.OverlayView)}},MarkerClustererEvents;(function(MarkerClustererEvents2){MarkerClustererEvents2.CLUSTERING_BEGIN="clusteringbegin",MarkerClustererEvents2.CLUSTERING_END="clusteringend",MarkerClustererEvents2.CLUSTER_CLICK="click"})(MarkerClustererEvents||(MarkerClustererEvents={}));var defaultOnClusterClickHandler=(_,cluster,map)=>{map.fitBounds(cluster.bounds)},MarkerClusterer=class extends OverlayViewSafe{constructor({map,markers=[],algorithmOptions={},algorithm=new SuperClusterAlgorithm(algorithmOptions),renderer=new DefaultRenderer,onClusterClick=defaultOnClusterClickHandler}){super();this.markers=[...markers],this.clusters=[],this.algorithm=algorithm,this.renderer=renderer,this.onClusterClick=onClusterClick,map&&this.setMap(map)}addMarker(marker,noDraw){this.markers.includes(marker)||(this.markers.push(marker),noDraw||this.render())}addMarkers(markers,noDraw){markers.forEach(marker=>{this.addMarker(marker,!0)}),noDraw||this.render()}removeMarker(marker,noDraw){let index=this.markers.indexOf(marker);return index===-1?!1:(MarkerUtils.setMap(marker,null),this.markers.splice(index,1),noDraw||this.render(),!0)}removeMarkers(markers,noDraw){let removed=!1;return markers.forEach(marker=>{removed=this.removeMarker(marker,!0)||removed}),removed&&!noDraw&&this.render(),removed}clearMarkers(noDraw){this.markers.length=0,noDraw||this.render()}render(){let map=this.getMap();if(map instanceof google.maps.Map&&map.getProjection()){google.maps.event.trigger(this,MarkerClustererEvents.CLUSTERING_BEGIN,this);let{clusters,changed}=this.algorithm.calculate({markers:this.markers,map,mapCanvasProjection:this.getProjection()});if(changed||changed==null){let singleMarker=new Set;for(let cluster of clusters)cluster.markers.length==1&&singleMarker.add(cluster.markers[0]);let groupMarkers=[];for(let cluster of this.clusters)cluster.marker!=null&&(cluster.markers.length==1?singleMarker.has(cluster.marker)||MarkerUtils.setMap(cluster.marker,null):groupMarkers.push(cluster.marker));this.clusters=clusters,this.renderClusters(),requestAnimationFrame(()=>groupMarkers.forEach(marker=>MarkerUtils.setMap(marker,null)))}google.maps.event.trigger(this,MarkerClustererEvents.CLUSTERING_END,this)}}onAdd(){this.idleListener=this.getMap().addListener("idle",this.render.bind(this)),this.render()}onRemove(){google.maps.event.removeListener(this.idleListener),this.reset()}reset(){this.markers.forEach(marker=>MarkerUtils.setMap(marker,null)),this.clusters.forEach(cluster=>cluster.delete()),this.clusters=[]}renderClusters(){let stats=new ClusterStats(this.markers,this.clusters),map=this.getMap();this.clusters.forEach(cluster=>{cluster.markers.length===1?cluster.marker=cluster.markers[0]:(cluster.marker=this.renderer.render(cluster,stats,map),cluster.markers.forEach(marker=>MarkerUtils.setMap(marker,null)),this.onClusterClick&&cluster.marker.addListener("click",event=>{google.maps.event.trigger(this,MarkerClustererEvents.CLUSTER_CLICK,cluster),this.onClusterClick(event,cluster,map)})),MarkerUtils.setMap(cluster.marker,map)})}};function restArguments(func,startIndex){return startIndex=startIndex==null?func.length-1:+startIndex,function(){for(var length=Math.max(arguments.length-startIndex,0),rest=Array(length),index=0;index<length;index++)rest[index]=arguments[index+startIndex];switch(startIndex){case 0:return func.call(this,rest);case 1:return func.call(this,arguments[0],rest);case 2:return func.call(this,arguments[0],arguments[1],rest)}var args=Array(startIndex+1);for(index=0;index<startIndex;index++)args[index]=arguments[index];return args[startIndex]=rest,func.apply(this,args)}}var now_default=Date.now||function(){return new Date().getTime()};function debounce(func,wait,immediate){var timeout,previous,args,result,context,later=function(){var passed=now_default()-previous;wait>passed?timeout=setTimeout(later,wait-passed):(timeout=null,immediate||(result=func.apply(context,args)),timeout||(args=context=null))},debounced=restArguments(function(_args){return context=this,args=_args,previous=now_default(),timeout||(timeout=setTimeout(later,wait),immediate&&(result=func.apply(context,args))),result});return debounced.cancel=function(){clearTimeout(timeout),timeout=args=context=null},debounced}function filamentGoogleMapsWidget({cachedData,config,mapEl}){return{map:null,bounds:null,infoWindow:null,mapEl:null,data:null,markers:[],layers:[],modelIds:[],mapIsFilter:!1,clusterer:null,center:null,isMapDragging:!1,isIdleSkipped:!1,config:{center:{lat:0,lng:0},clustering:!1,controls:{mapTypeControl:!0,scaleControl:!0,streetViewControl:!0,rotateControl:!0,fullscreenControl:!0,searchBoxControl:!1,zoomControl:!1},fit:!0,mapIsFilter:!1,gmaps:"",layers:[],zoom:12,markerAction:null,mapConfig:[]},loadGMaps:function(){if(document.getElementById("filament-google-maps-google-maps-js")){let waitForGlobal=function(key,callback){window[key]?callback():setTimeout(function(){waitForGlobal(key,callback)},100)};waitForGlobal("filamentGoogleMapsAPILoaded",function(){this.createMap()}.bind(this))}else{let script=document.createElement("script");script.id="filament-google-maps-google-maps-js",window.filamentGoogleMapsAsyncLoad=this.createMap.bind(this),script.src=this.config.gmaps+"&callback=filamentGoogleMapsAsyncLoad",document.head.appendChild(script)}},init:function(){this.mapEl=document.getElementById(mapEl)||mapEl,this.data=cachedData,this.config={...this.config,...config},this.loadGMaps()},callWire:function(thing){},createMap:function(){window.filamentGoogleMapsAPILoaded=!0,this.infoWindow=new google.maps.InfoWindow({content:"",disableAutoPan:!0}),this.map=new google.maps.Map(this.mapEl,{center:this.config.center,zoom:this.config.zoom,...this.config.controls,...this.config.mapConfig}),this.center=this.config.center,this.createMarkers(),this.createClustering(),this.createLayers(),this.idle(),window.addEventListener("filament-google-maps::widget/setMapCenter",event=>{this.recenter(event.detail)}),this.show(!0)},show:function(force=!1){this.markers.length>0&&this.config.fit?this.fitToBounds(force):this.markers.length>0?this.map.setCenter(this.markers[0].getPosition()):this.map.setCenter(this.config.center)},createLayers:function(){this.layers=this.config.layers.map(layerUrl=>new google.maps.KmlLayer({url:layerUrl,map:this.map}))},createMarker:function(location){let markerIcon;location.icon&&typeof location.icon=="object"&&location.icon.hasOwnProperty("url")&&(markerIcon={url:location.icon.url},location.icon.hasOwnProperty("type")&&location.icon.type==="svg"&&(location.icon.hasOwnProperty("color")&&fetch(location.icon.url).then(response=>response.text()).then(svgContent=>{let coloredSvg=svgContent.replace(/<path[^>]*fill="[^"]*"/,match=>match.replace(/fill="[^"]*"/,`fill="${location.icon.color}"`)),svgBlob=new Blob([coloredSvg],{type:"image/svg+xml"}),svgUrl=URL.createObjectURL(svgBlob);markerIcon.url=svgUrl,marker.setIcon(markerIcon)}),location.icon.hasOwnProperty("scale")&&(markerIcon.scaledSize=new google.maps.Size(location.icon.scale[0],location.icon.scale[1]))));let point=location.location,label=location.label,marker=new google.maps.Marker({position:point,title:label,model_id:location.id,...markerIcon&&{icon:markerIcon}});return this.modelIds.indexOf(location.id)===-1&&this.modelIds.push(location.id),marker},createMarkers:function(){this.markers=this.data.map(location=>{let marker=this.createMarker(location);return marker.setMap(this.map),this.config.markerAction&&google.maps.event.addListener(marker,"click",event=>{this.$wire.mountAction(this.config.markerAction,{model_id:marker.model_id})}),marker})},removeMarker:function(marker){marker.setMap(null)},removeMarkers:function(){for(let i=0;i<this.markers.length;i++)this.markers[i].setMap(null);this.markers=[]},mergeMarkers:function(){let operation=(list1,list2,isUnion=!1)=>list1.filter(a=>isUnion===list2.some(b=>a.getPosition().lat()===b.getPosition().lat()&&a.getPosition().lng()===b.getPosition().lng())),inBoth=(list1,list2)=>operation(list1,list2,!0),inFirstOnly=operation,inSecondOnly=(list1,list2)=>inFirstOnly(list2,list1),newMarkers=this.data.map(location=>{let marker=this.createMarker(location);return marker.addListener("click",()=>{this.infoWindow.setContent(location.label),this.infoWindow.open(this.map,marker)}),marker});if(!this.config.mapIsFilter){let oldMarkersRemove=inSecondOnly(newMarkers,this.markers);for(let i=oldMarkersRemove.length-1;i>=0;i--){oldMarkersRemove[i].setMap(null);let index=this.markers.findIndex(marker=>marker.getPosition().lat()===oldMarkersRemove[i].getPosition().lat()&&marker.getPosition().lng()===oldMarkersRemove[i].getPosition().lng());this.markers.splice(index,1)}}let newMarkersCreate=inSecondOnly(this.markers,newMarkers);for(let i=0;i<newMarkersCreate.length;i++)newMarkersCreate[i].setMap(this.map),this.markers.push(newMarkersCreate[i]);this.fitToBounds()},fitToBounds:function(force=!1){if(this.markers.length>0&&this.config.fit&&(force||!this.config.mapIsFilter)){this.bounds=new google.maps.LatLngBounds;for(let marker of this.markers)this.bounds.extend(marker.getPosition());this.map.fitBounds(this.bounds)}},createClustering:function(){this.markers.length>0&&this.config.clustering&&(this.clusterer=new MarkerClusterer({map:this.map,markers:this.markers}))},updateClustering:function(){this.config.clustering&&(this.clusterer.clearMarkers(),this.clusterer.addMarkers(this.markers))},moved:function(){function areEqual(array1,array2){return array1.length===array2.length?array1.every((element,index)=>element===array2[index]):!1}console.log("moved");let bounds=this.map.getBounds(),ids=this.markers.filter(marker=>bounds.contains(marker.getPosition())).map(marker=>marker.model_id);areEqual(this.modelIds,ids)||(this.modelIds=ids,console.log(ids),this.$wire.set("mapFilterIds",ids))},idle:function(){if(this.config.mapIsFilter){let that=self,debouncedMoved=debounce(this.moved,1e3).bind(this);google.maps.event.addListener(this.map,"idle",event=>{if(self.isMapDragging){self.idleSkipped=!0;return}self.idleSkipped=!1,debouncedMoved()}),google.maps.event.addListener(this.map,"dragstart",event=>{self.isMapDragging=!0}),google.maps.event.addListener(this.map,"dragend",event=>{self.isMapDragging=!1,self.idleSkipped===!0&&(debouncedMoved(),self.idleSkipped=!1)}),google.maps.event.addListener(this.map,"bounds_changed",event=>{self.idleSkipped=!1})}},update:function(data){this.data=data,this.mergeMarkers(),this.updateClustering(),this.show()},recenter:function(data){this.map.panTo({lat:data.lat,lng:data.lng}),this.map.setZoom(data.zoom)}}}export{filamentGoogleMapsWidget as default};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
