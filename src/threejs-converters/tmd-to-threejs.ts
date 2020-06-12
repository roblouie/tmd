import * as THREE from 'three';
import { MaterialTracker } from "./material-tracker";
import { FlatTexturedConverter } from "./primitives/three-sided/flat-textured.converter";
import { FlatNoTextureSolidConverter } from "./primitives/three-sided/flat-no-texture-solid.converter";
import { GouradNoTextureSolidConverter } from "./primitives/three-sided/gourad-no-texture-solid.converter";
import { GouradTexturedConverter } from "./primitives/three-sided/gourad-textured.converter";
import { TMD, TMDObject } from '../tmd/tmd';
import { VRAM } from '../vram/vram';
import { Primitive } from '../tmd/primitive';
import { PrimitiveType } from '../tmd/primitive-type.enum';
import { TIM } from '../tim/tim';
import { NoLightTexturedSolidConverter } from './primitives/three-sided/no-light-textured-solid.converter';
import { NoLightNoTextureSolidConverter } from './primitives/three-sided/no-light-no-texture-solid.converter';
import { FlatNoTextureGradientConverter } from './primitives/three-sided/flat-no-texture-gradient.converter';
import { ExpandedTexturePage } from './expanded-texture-page';
import FourSidedConverter from './primitives/four-sided/four-sided.converter';

export class TMDToThreeJS {

  convertWithTMDAndExpandedTexturePages(tmd: TMD, expandedTexturePages: ExpandedTexturePage[]) {
    const meshArray: THREE.Mesh[] = [];

    tmd.objects.forEach(object => {
      const materialTracker = new MaterialTracker();
      const geometry = new THREE.Geometry();

      geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, vertex.y, vertex.z));

      object.primitives.forEach(primitive => {
        const materialIndex = materialTracker.createMaterialFromExpandedTexturePageAndGetIndex(primitive, expandedTexturePages);

        this.populateGeometry(primitive, geometry, object, materialIndex);
      });

      geometry.applyMatrix4(new THREE.Matrix4().makeScale(1, -1, 1));

      meshArray.push(new THREE.Mesh(geometry, materialTracker.objectMaterials));
    });

    var geo = new THREE.EdgesGeometry(meshArray[0].geometry); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
    var wireframe = new THREE.LineSegments(geo, mat);
    meshArray[0].add(wireframe);

    return meshArray;
  }

  convertWithTMDAndVRAM(tmd: TMD, vram: VRAM) {
    return tmd.objects.map(object => this.objectToMeshWithVRAM(object, vram))
  }

  convertWithTMDAndTIM(tmd: TMD, tims: TIM[]): THREE.Mesh[] {
    const meshArray: THREE.Mesh[] = [];

    tmd.objects.forEach(object => {
      const materialTracker = new MaterialTracker();
      const geometry = new THREE.Geometry();

      geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));

      object.primitives.forEach(primitive => {
        const materialIndex = materialTracker.createMaterialFromTIMAndGetIndex(primitive, tims);

        this.populateGeometry(primitive, geometry, object, materialIndex);
      });


      meshArray.push(new THREE.Mesh(geometry, materialTracker.objectMaterials));
    });

    return meshArray;
  }

  convertWithTMDOnly(tmd: TMD) {
    const meshArray: THREE.Mesh[] = [];

    tmd.objects.forEach(object => {
      const materialTracker = new MaterialTracker();
      const geometry = new THREE.Geometry();

      geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));

      object.primitives.forEach(primitive => {
        const materialIndex = materialTracker.createMaterialWithoutTexture(primitive);

        this.populateGeometry(primitive, geometry, object, materialIndex);
      });

      geometry.faceVertexUvs[0] = []; // Clear the UVs that were brought over from PS1 since we don't have a texture;

      meshArray.push(new THREE.Mesh(geometry, materialTracker.objectMaterials));
    });

    return meshArray;
  }

  private objectToMeshWithVRAM(object: TMDObject, vram: VRAM) {

    // convert lines separately, this should be improved upon.
    if (object.primitives[0].codeType === 'Line') {
      return this.convertLines(object);
    }

    const materialTracker = new MaterialTracker();
    const geometry = new THREE.Geometry();

    geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));

    object.primitives.forEach(primitive => {
      const materialIndex = materialTracker.createMaterialFromVRAMAndGetIndex(primitive, vram);

      this.populateGeometry(primitive, geometry, object, materialIndex);
    });

    return new THREE.Mesh(geometry, materialTracker.objectMaterials);
  }

  private populateGeometry(primitive: Primitive, geometry: THREE.Geometry, object: TMDObject, materialIndex: number) {
    switch (primitive.packetDataType) {
      case PrimitiveType.THREE_SIDED_FLAT_NO_TEXTURE_SOLID:
        geometry.faces.push(FlatNoTextureSolidConverter.GetFace(primitive.packetData, object.normals, materialIndex));
        break;
      case PrimitiveType.THREE_SIDED_FLAT_NO_TEXTURE_GRADIENT:
        geometry.faces.push(FlatNoTextureGradientConverter.GetFace(primitive.packetData, object.normals, materialIndex));
        break;
      case PrimitiveType.THREE_SIDED_GOURAD_NO_TEXTURE_SOLID:
        geometry.faces.push(GouradNoTextureSolidConverter.GetFace(primitive.packetData, object.normals, materialIndex));
        break;
      case PrimitiveType.THREE_SIDED_FLAT_TEXTURE:
        geometry.faces.push(FlatTexturedConverter.GetFace(primitive.packetData, object.normals, materialIndex));
        geometry.faceVertexUvs[0].push(this.getUVs(primitive));
        break;
      case PrimitiveType.THREE_SIDED_GOURAD_TEXTURE:
        geometry.faces.push(GouradTexturedConverter.GetFace(primitive.packetData, object.normals, materialIndex));
        geometry.faceVertexUvs[0].push(this.getUVs(primitive));
        break;
      case PrimitiveType.THREE_SIDED_NO_LIGHT_NO_TEXTURE_SOLID:
        geometry.faces.push(NoLightNoTextureSolidConverter.GetFace(primitive.packetData, materialIndex));
        break;
      case PrimitiveType.THREE_SIDED_NO_LIGHT_TEXTURE_SOLID:
        geometry.faces.push(NoLightTexturedSolidConverter.GetFace(primitive.packetData, materialIndex));
        geometry.faceVertexUvs[0].push(this.getUVs(primitive));
        break;
      case PrimitiveType.FOUR_SIDED_NO_LIGHT_TEXTURED_SOLID:
        geometry.faces.push(...FourSidedConverter.NoLightTexturedSolid(primitive.packetData, materialIndex));
        geometry.faceVertexUvs[0].push(this.getUVs(primitive));
        geometry.faceVertexUvs[0].push(this.getUVsForSecondHalfOfFourSided(primitive));
        break;
      case PrimitiveType.FOUR_SIDED_FLAT_TEXTURE_NO_COLOR:
        geometry.faces.push(...FourSidedConverter.FlatTexturedNoColor(primitive.packetData, materialIndex));
        geometry.faceVertexUvs[0].push(this.getUVs(primitive));
        geometry.faceVertexUvs[0].push(this.getUVsForSecondHalfOfFourSided(primitive));
        break;
      case PrimitiveType.FOUR_SIDED_NO_LIGHT_NO_TEXTURE_SOLID:
        geometry.faces.push(...FourSidedConverter.NoLightNoTextureSolid(primitive.packetData, materialIndex));
        break;
    }

    // test code
    //geometry.computeVertexNormals();
  }

  private getUVs(primitive: Primitive) {
    const { u0, v0, u1, v1, u2, v2 } = primitive.packetData;
    const uv0 = new THREE.Vector2(u0 / VRAM.ACCESSIBLE_TEXTURE_WIDTH, v0 / VRAM.ACCESSIBLE_TEXTURE_HEIGHT);
    const uv1 = new THREE.Vector2(u1 / VRAM.ACCESSIBLE_TEXTURE_WIDTH, v1 / VRAM.ACCESSIBLE_TEXTURE_HEIGHT);
    const uv2 = new THREE.Vector2(u2 / VRAM.ACCESSIBLE_TEXTURE_WIDTH, v2 / VRAM.ACCESSIBLE_TEXTURE_HEIGHT);
    return [uv0, uv1, uv2];
  }

  private getUVsForSecondHalfOfFourSided(primitive: Primitive) {
    const { u1, v1, u2, v2, u3, v3 } = primitive.packetData;
    const uv1 = new THREE.Vector2(u1 / VRAM.ACCESSIBLE_TEXTURE_WIDTH, v1 / VRAM.ACCESSIBLE_TEXTURE_HEIGHT);
    const uv2 = new THREE.Vector2(u2 / VRAM.ACCESSIBLE_TEXTURE_WIDTH, v2 / VRAM.ACCESSIBLE_TEXTURE_HEIGHT);
    const uv3 = new THREE.Vector2(u3 / VRAM.ACCESSIBLE_TEXTURE_WIDTH, v3 / VRAM.ACCESSIBLE_TEXTURE_HEIGHT);
    return [uv1, uv3, uv2];
  }

  private convertLines(object: TMDObject): THREE.Line {
    const points: THREE.Vector3[] = [];
    object.primitives.forEach(primitive => {
      if (points.length === 0) {
        const vertex0 = object.vertices[primitive.packetData.vertex0];
        points.push(new THREE.Vector3(vertex0.x, vertex0.y, vertex0.z));
      }

      const vertex1 = object.vertices[primitive.packetData.vertex1];
      points.push(new THREE.Vector3(vertex1.x, vertex1.y, vertex1.z));
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
  }
}