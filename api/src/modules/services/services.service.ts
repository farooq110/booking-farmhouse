import { ServiceModel } from "../../models/service.model"
import { CreateServiceDto, UpdateServiceDto } from "./services.validation"
import { Types } from "mongoose"

export class ServicesService {
  async create(ownerId: string, dto: CreateServiceDto) {
    const service = new ServiceModel({
      ...dto,
      owner_id: new Types.ObjectId(ownerId),
    })
    return service.save()
  }

  async findAllByOwner(ownerId: string) {
    return ServiceModel.find({ owner_id: new Types.ObjectId(ownerId), is_active: true })
  }

  async findOne(serviceId: string) {
    return ServiceModel.findById(serviceId)
  }

  async update(serviceId: string, dto: UpdateServiceDto) {
    return ServiceModel.findByIdAndUpdate(
      serviceId,
      { $set: dto },
      { new: true },
    )
  }

  async remove(serviceId: string) {
    return ServiceModel.findByIdAndUpdate(
      serviceId,
      { $set: { is_active: false } },
      { new: true },
    )
  }
}
